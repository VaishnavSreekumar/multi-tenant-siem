package repository

import (
	"database/sql"
	"encoding/json"

	"siem/internal/events"
)

type LogRepository struct {
	DB *sql.DB
}

func NewLogRepository(db *sql.DB) *LogRepository {
	return &LogRepository{
		DB: db,
	}
}

func (r *LogRepository) InsertLog(event events.Event) error {
	metadataJSON, err := json.Marshal(event.Payload)
	if err != nil {
		return err
	}

	query := `
    INSERT INTO logs (
        timestamp,
        tenant_id,
        service,
        level,
        message,
        metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    `

	_, err = r.DB.Exec(
		query,
		event.Timestamp,
		event.TenantID,
		event.Source,
		event.Severity,
		event.Message,
		metadataJSON,
	)

	return err
}

func (r *LogRepository) InsertLogsBatch(eventsBatch []events.Event) error {
	if len(eventsBatch) == 0 {
		return nil
	}

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	query := `
    INSERT INTO logs (
        timestamp,
        tenant_id,
        service,
        level,
        message,
        metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    `

	stmt, err := tx.Prepare(query)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, event := range eventsBatch {
		metadataJSON, _ := json.Marshal(event.Payload)
		_, err = stmt.Exec(
			event.Timestamp,
			event.TenantID,
			event.Source,
			event.Severity,
			event.Message,
			metadataJSON,
		)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}
