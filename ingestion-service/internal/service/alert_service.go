package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"siem/internal/detection"
	"siem/internal/metrics"
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

func sendSlackNotification(alert model.Alert) {
	webhookURL := os.Getenv("SLACK_WEBHOOK_URL")
	if webhookURL == "" {
		return
	}

	payload := map[string]interface{}{
		"text": fmt.Sprintf(
			"🚨 *SentinelX Security Alert* 🚨\n"+
				"*Tenant*: `%s`\n"+
				"*Type*: `%s`\n"+
				"*Severity*: `%s`\n"+
				"*Source IP*: `%s`\n"+
				"*Message*: %s",
			alert.TenantID,
			alert.AlertType,
			alert.Severity,
			alert.SourceIP,
			alert.Message,
		),
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("failed to marshal Slack payload:", err)
		return
	}

	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(jsonBytes))
	if err != nil {
		fmt.Println("failed to send Slack notification:", err)
		return
	}
	defer resp.Body.Close()
}

func (s *AlertService) CreateAlert(
	alert model.Alert,
) error {
	// 1. Check for duplicate alert suppression (within 5 mins)
	if detection.ShouldSuppressAlert(alert) {
		return nil
	}

	// 2. Store alert in database
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

	// 3. Broadcast FULL stored alert
	websocket.WS.Broadcast(
		storedAlert,
	)

	metrics.AlertsGenerated.WithLabelValues(storedAlert.AlertType, storedAlert.Severity).Inc()

	fmt.Printf(
		"🚨 ALERT STORED: type=%s ip=%s tenant=%s\n",
		storedAlert.AlertType,
		storedAlert.SourceIP,
		storedAlert.TenantID,
	)

	// 4. Send Slack notification asynchronously
	go sendSlackNotification(storedAlert)

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
