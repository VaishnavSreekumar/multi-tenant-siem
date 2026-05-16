package validator

import (
	"errors"
	"time"

	"siem/internal/events"
)

func ValidateLog(event events.Event) error {
	if event.TenantID == "" {
		return errors.New("tenant_id is required")
	}

	if event.Source == "" {
		return errors.New("source is required")
	}

	if event.EventType == "" {
		return errors.New("event_type is required")
	}

	if event.Message == "" {
		return errors.New("message is required")
	}

	// Check if timestamp is zero/uninitialized
	if event.Timestamp.IsZero() {
		return errors.New("timestamp is required or invalid")
	}

	// Optional sanity check:
	// reject timestamps far in future
	if event.Timestamp.After(time.Now().Add(24 * time.Hour)) {
		return errors.New("timestamp cannot be in the far future")
	}

	return nil
}
