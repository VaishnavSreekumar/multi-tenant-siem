package detection

import (
	"fmt"
	"sync"
	"time"

	"siem/internal/model"
)

type AlertCache struct {
	LastSeen time.Time
}

var (
	alertMap = make(
		map[string]*AlertCache,
	)

	alertMutex sync.Mutex
)

func ShouldSuppressAlert(
	alert model.Alert,
) bool {

	key := fmt.Sprintf(
		"%s:%s",
		alert.AlertType,
		alert.SourceIP,
	)

	alertMutex.Lock()
	defer alertMutex.Unlock()

	entry, exists := alertMap[key]

	if !exists {

		alertMap[key] = &AlertCache{
			LastSeen: time.Now(),
		}

		return false
	}

	// Suppress within 5 minutes
	if time.Since(
		entry.LastSeen,
	) < 5*time.Minute {

		fmt.Println(
			"🚫 ALERT SUPPRESSED:",
			key,
		)

		return true
	}

	entry.LastSeen = time.Now()

	return false
}
