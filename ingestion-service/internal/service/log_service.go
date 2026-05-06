package service

import (
	"siem/ingestion-service/internal/model"
	"siem/ingestion-service/internal/queue"
	"siem/ingestion-service/internal/repository"
)

type LogService struct {
	repo *repository.LogRepository
}

func NewLogService(repo *repository.LogRepository) *LogService {
	return &LogService{
		repo: repo,
	}
}

// Add log to queue
func (s *LogService) EnqueueLog(log model.Log) {
	queue.LogQueue <- log
}

// Actual DB insert
func (s *LogService) ProcessLog(log model.Log) error {
	return s.repo.InsertLog(log)
}
