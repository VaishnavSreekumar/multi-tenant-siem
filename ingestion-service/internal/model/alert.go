package model

import "time"

type Alert struct {
	ID        int       `json:"id"`
	TenantID  string    `json:"tenant_id"`
	AlertType string    `json:"alert_type"`
	Severity  string    `json:"severity"`
	Message   string    `json:"message"`
	SourceIP  string    `json:"source_ip"`
	CreatedAt time.Time `json:"created_at"`
}
