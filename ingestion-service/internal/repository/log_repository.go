package repository

import (
	"database/sql"
	"encoding/json"

	"siem/ingestion-service/internal/model"
)

type LogRepository struct {
	DB *sql.DB
}

func NewLogRepository(db *sql.DB) *LogRepository {
	return &LogRepository{
		DB: db,
	}
}

func (r *LogRepository) InsertLog(log model.Log) error {
	metadataJSON, err := json.Marshal(log.Metadata)
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
		log.Timestamp,
		log.TenantID,
		log.Service,
		log.Level,
		log.Message,
		metadataJSON,
	)

	return err
}
