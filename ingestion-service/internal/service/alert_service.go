package service

import (
	"fmt"

	"siem/ingestion-service/internal/model"
	"siem/ingestion-service/internal/repository"
)

type AlertService struct {
	repo *repository.AlertRepository
}

func NewAlertService(repo *repository.AlertRepository) *AlertService {
	return &AlertService{
		repo: repo,
	}
}

func (s *AlertService) CreateAlert(alert model.Alert) {

	err := s.repo.CreateAlert(alert)
	if err != nil {
		fmt.Println("Failed to store alert:", err)
		return
	}

	fmt.Printf(
		"🚨 ALERT STORED: type=%s ip=%s\n",
		alert.AlertType,
		alert.SourceIP,
	)
}

func (s *AlertService) GetAlerts() ([]model.Alert, error) {
	return s.repo.GetAlerts()
}
