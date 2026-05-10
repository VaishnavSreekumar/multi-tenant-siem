package service

import (
	"fmt"

	"siem/internal/model"
	"siem/internal/repository"
	"siem/internal/websocket"
)

type AlertService struct {
	repo *repository.AlertRepository
}

func NewAlertService(
	repo *repository.AlertRepository,
) *AlertService {

	return &AlertService{
		repo: repo,
	}
}

func (s *AlertService) CreateAlert(
	alert model.Alert,
) error {

	// Store alert in database
	storedAlert, err := s.repo.CreateAlert(
		alert,
	)

	if err != nil {

		fmt.Println(
			"❌ Failed to store alert:",
			err,
		)

		return err
	}

	// Broadcast FULL stored alert
	// including generated ID + created_at
	websocket.WS.Broadcast(
		storedAlert,
	)

	fmt.Printf(
		"🚨 ALERT STORED: type=%s ip=%s tenant=%s\n",
		storedAlert.AlertType,
		storedAlert.SourceIP,
		storedAlert.TenantID,
	)

	return nil
}

func (s *AlertService) GetAlerts(
	tenantID string,
) ([]model.Alert, error) {

	alerts, err := s.repo.GetAlerts(
		tenantID,
	)

	if err != nil {
		return nil, err
	}

	return alerts, nil
}

func (s *AnalyticsService) GetTopPaths() (
	[]model.TopPath,
	error,
) {

	return s.repo.GetTopPaths()
}
