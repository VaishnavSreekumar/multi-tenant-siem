package service

import (
	"siem/internal/model"
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

func extractIP(log model.Log) string {
	if ip, ok := log.Metadata["ip"].(string); ok {
		return ip
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
func (s *LogService) EnqueueLog(log model.Log) {
	queue.LogQueue <- log
}

// Store log in database
func (s *LogService) ProcessLog(log model.Log) error {
	return s.repo.InsertLog(log)
}
