package detection

import (
	"fmt"
	"sync"
	"time"

	"siem/internal/model"
)

type FailedAttempt struct {
	Count       int
	LastAttempt time.Time
}

var (
	failedLogins = make(
		map[string]*FailedAttempt,
	)

	bruteForceMutex sync.Mutex
)

func DetectBruteForce(
	log model.Log,
) *model.Alert {

	// --------------------------------
	// ONLY PROCESS ERROR LOGS
	// --------------------------------

	if log.Level != "ERROR" {
		return nil
	}

	// --------------------------------
	// EXTRACT SOURCE IP
	// --------------------------------

	ip, ok := log.Metadata["ip"].(string)

	if !ok {

		fmt.Println(
			"failed to extract IP",
		)

		return nil
	}

	fmt.Println(
		"FAILED LOGIN FROM:",
		ip,
	)

	// --------------------------------
	// LOCK SHARED STATE
	// --------------------------------

	bruteForceMutex.Lock()
	defer bruteForceMutex.Unlock()

	entry, exists := failedLogins[ip]

	// --------------------------------
	// FIRST FAILED ATTEMPT
	// --------------------------------

	if !exists {

		fmt.Println(
			"tracking new attacker:",
			ip,
		)

		failedLogins[ip] = &FailedAttempt{
			Count:       1,
			LastAttempt: time.Now(),
		}

		return nil
	}

	// --------------------------------
	// RESET WINDOW AFTER 1 MINUTE
	// --------------------------------

	if time.Since(
		entry.LastAttempt,
	) > time.Minute {

		fmt.Println(
			"resetting brute force window",
		)

		entry.Count = 1
		entry.LastAttempt = time.Now()

		return nil
	}

	// --------------------------------
	// INCREMENT ATTEMPT COUNTER
	// --------------------------------

	entry.Count++
	entry.LastAttempt = time.Now()

	fmt.Printf(
		"BRUTE FORCE COUNT ip=%s count=%d\n",
		ip,
		entry.Count,
	)

	// --------------------------------
	// DETECT BRUTE FORCE
	// --------------------------------

	if entry.Count >= 5 {

		fmt.Println(
			"🚨 BRUTE_FORCE DETECTED",
		)

		alert := &model.Alert{
			TenantID:  log.TenantID,
			AlertType: "BRUTE_FORCE",
			Severity:  "HIGH",
			Message:   "Multiple failed login attempts detected",
			SourceIP:  ip,
		}

		// Reset counter after alert
		entry.Count = 0

		return alert
	}

	return nil
}
