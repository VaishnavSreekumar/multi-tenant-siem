package service

import (
	"siem/ingestion-service/internal/model"
	"siem/ingestion-service/internal/queue"
	"siem/ingestion-service/internal/repository"
)

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
