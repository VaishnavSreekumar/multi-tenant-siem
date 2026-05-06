package repository

import (
	"database/sql"

	"siem/ingestion-service/internal/model"
)

type AlertRepository struct {
	DB *sql.DB
}

func NewAlertRepository(db *sql.DB) *AlertRepository {
	return &AlertRepository{
		DB: db,
	}
}

// Store alert in database
func (r *AlertRepository) CreateAlert(
	alert model.Alert,
) error {

	query := `
	INSERT INTO alerts (
		tenant_id,
		alert_type,
		severity,
		message,
		source_ip
	)
	VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.DB.Exec(
		query,
		alert.TenantID,
		alert.AlertType,
		alert.Severity,
		alert.Message,
		alert.SourceIP,
	)

	return err
}

// Fetch all alerts
func (r *AlertRepository) GetAlerts() (
	[]model.Alert,
	error,
) {

	query := `
	SELECT
		id,
		tenant_id,
		alert_type,
		severity,
		message,
		source_ip,
		created_at
	FROM alerts
	ORDER BY created_at DESC
	`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []model.Alert

	for rows.Next() {

		var alert model.Alert

		err := rows.Scan(
			&alert.ID,
			&alert.TenantID,
			&alert.AlertType,
			&alert.Severity,
			&alert.Message,
			&alert.SourceIP,
			&alert.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		alerts = append(alerts, alert)
	}

	return alerts, nil
}
