package detection

import (
	"fmt"
	"sync"
	"time"

	"siem/internal/events"
	"siem/internal/model"
)

type ScanTracker struct {
	Count    int
	LastSeen time.Time
}

var (
	scanMap = make(
		map[string]*ScanTracker,
	)

	mutex sync.Mutex
)

func DetectWebScan(
	event events.Event,
) *model.Alert {

	// --------------------------------
	// ONLY PROCESS NGINX LOGS
	// --------------------------------

	if event.Source != "nginx" {
		return nil
	}

	// --------------------------------
	// EXTRACT PATH
	// --------------------------------

	path, ok := event.Payload["path"].(string)

	if !ok {

		fmt.Println(
			"failed to extract path",
		)

		return nil
	}

	fmt.Println(
		"PATH:",
		path,
	)

	// --------------------------------
	// CHECK SUSPICIOUS PATH
	// --------------------------------

	if !isSuspiciousPath(path) {

		fmt.Println(
			"path not suspicious",
		)

		return nil
	}

	fmt.Println(
		"🚨 suspicious path detected",
	)

	// --------------------------------
	// EXTRACT SOURCE IP
	// --------------------------------

	ip := event.IPAddress
	if ip == "" {
		ip = "unknown"
	}

	// --------------------------------
	// TRACK ATTACKER ACTIVITY
	// --------------------------------

	mutex.Lock()
	defer mutex.Unlock()

	tracker, exists := scanMap[ip]

	if !exists {

		fmt.Println(
			"new attacker tracked:",
			ip,
		)

		scanMap[ip] = &ScanTracker{
			Count:    1,
			LastSeen: time.Now(),
		}

		return nil
	}

	// --------------------------------
	// RESET WINDOW AFTER 1 MINUTE
	// --------------------------------

	if time.Since(
		tracker.LastSeen,
	) > time.Minute {

		fmt.Println(
			"resetting attacker window",
		)

		tracker.Count = 0
	}

	// --------------------------------
	// INCREMENT COUNTER
	// --------------------------------

	tracker.Count++

	tracker.LastSeen = time.Now()

	fmt.Printf(
		"attacker=%s count=%d\n",
		ip,
		tracker.Count,
	)

	// --------------------------------
	// CORRELATED DETECTION
	// --------------------------------

	if tracker.Count >= 5 {

		fmt.Println(
			"🚨 WEB_SCAN DETECTED",
		)

		// Reset counter after alert
		tracker.Count = 0

		return &model.Alert{
			TenantID:  event.TenantID,
			AlertType: "WEB_SCAN",
			Severity:  "CRITICAL",
			Message:   "Web scanning behavior detected",
			SourceIP:  ip,
		}
	}

	return nil
}

func isSuspiciousPath(
	path string,
) bool {

	suspiciousPaths := []string{
		"/admin",
		"/wp-admin",
		"/wp-login.php",
		"/phpmyadmin",
		"/.env",
		"/.git/config",
		"/config.php",
		"/backup.zip",
	}

	for _, suspicious := range suspiciousPaths {

		if path == suspicious {
			return true
		}
	}

	return false
}
