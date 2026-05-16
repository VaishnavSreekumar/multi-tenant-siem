package events

import "time"

type Event struct {
	TenantID  string                 `json:"tenant_id"`
	Source    string                 `json:"source"`
	EventType string                 `json:"event_type"`
	Timestamp time.Time              `json:"timestamp"`
	Severity  string                 `json:"severity"`
	IPAddress string                 `json:"ip_address"`
	Hostname  string                 `json:"hostname"`
	Message   string                 `json:"message"`
	Payload   map[string]interface{} `json:"payload"`
}
