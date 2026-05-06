package detection

import (
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

func DetectBruteForce(log model.Log) *model.Alert {

	if log.Level != "ERROR" {
		return nil
	}

	ip, ok := log.Metadata["ip"].(string)
	if !ok {
		return nil
	}

	mutex.Lock()
	defer mutex.Unlock()

	entry, exists := failedLogins[ip]

	if !exists {
		failedLogins[ip] = &FailedAttempt{
			Count:       1,
			LastAttempt: time.Now(),
		}

		return nil
	}

	// Reset after 1 minute
	if time.Since(entry.LastAttempt) > time.Minute {
		entry.Count = 1
		entry.LastAttempt = time.Now()
		return nil
	}

	entry.Count++
	entry.LastAttempt = time.Now()

	if entry.Count >= 5 {

		alert := &model.Alert{
			TenantID:  log.TenantID,
			AlertType: "BRUTE_FORCE",
			Severity:  "HIGH",
			Message:   "Multiple failed login attempts detected",
			SourceIP:  ip,
		}

		entry.Count = 0

		return alert
	}

	return nil
}
