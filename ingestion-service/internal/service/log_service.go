package service

import (
	"siem/internal/events"
	"siem/internal/queue"
	"siem/internal/repository"
)

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

func extractIP(event events.Event) string {
	if event.IPAddress != "" {
		return event.IPAddress
	}
	return "unknown"
}

type LogService struct {
	repo         *repository.LogRepository
	alertService *AlertService
}

func NewLogService(
	repo *repository.LogRepository,
	alertService *AlertService,
) *LogService {

	return &LogService{
		repo:         repo,
		alertService: alertService,
	}
}

// Add log to queue
func (s *LogService) EnqueueLog(event events.Event) {
	queue.LogQueue <- event
}

// Store log in database
func (s *LogService) ProcessLog(event events.Event) error {
	return s.repo.InsertLog(event)
}
