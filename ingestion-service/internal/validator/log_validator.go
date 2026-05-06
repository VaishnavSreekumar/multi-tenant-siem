package validator

import (
	"errors"
	"time"

	"siem/ingestion-service/internal/model"
)

func ValidateLog(log model.Log) error {
	if log.TenantID == "" {
		return errors.New("tenant_id is required")
	}

	if log.Service == "" {
		return errors.New("service is required")
	}

	if log.Level == "" {
		return errors.New("level is required")
	}

	if log.Message == "" {
		return errors.New("message is required")
	}

	// Check if timestamp is zero/uninitialized
	if log.Timestamp.IsZero() {
		return errors.New("timestamp is required or invalid")
	}

	// Optional sanity check:
	// reject timestamps far in future
	if log.Timestamp.After(time.Now().Add(24 * time.Hour)) {
		return errors.New("timestamp cannot be in the far future")
	}

	return nil
}
