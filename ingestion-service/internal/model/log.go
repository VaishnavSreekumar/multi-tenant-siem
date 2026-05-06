package model

import "time"

type Log struct {
	Timestamp time.Time              `json:"timestamp"`
	TenantID  string                 `json:"tenant_id"`
	Service   string                 `json:"service"`
	Level     string                 `json:"level"`
	Message   string                 `json:"message"`
	Metadata  map[string]interface{} `json:"metadata"`
}
