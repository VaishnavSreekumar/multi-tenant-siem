package detection

import (
	"fmt"
	"sync"
	"time"

	"siem/ingestion-service/internal/model"
)

type FailedAttempt struct {
	Count       int
	LastAttempt time.Time
}

var (
	failedLogins = make(map[string]*FailedAttempt)
	mutex        sync.Mutex
)

func DetectBruteForce(log model.Log) {
	// Only monitor failed login messages
	if log.Level != "ERROR" {
		return
	}

	ip, ok := log.Metadata["ip"].(string)
	if !ok {
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	entry, exists := failedLogins[ip]

	if !exists {
		failedLogins[ip] = &FailedAttempt{
			Count:       1,
			LastAttempt: time.Now(),
		}

		return
	}

	// Reset counter after 1 minute
	if time.Since(entry.LastAttempt) > time.Minute {
		entry.Count = 1
		entry.LastAttempt = time.Now()
		return
	}

	entry.Count++
	entry.LastAttempt = time.Now()

	if entry.Count >= 5 {
		fmt.Printf(
			"🚨 BRUTE FORCE DETECTED: IP=%s attempts=%d\n",
			ip,
			entry.Count,
		)

		// reset after alert
		entry.Count = 0
	}
}
