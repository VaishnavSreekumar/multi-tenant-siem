package model

type TrafficAnalytics struct {
	TotalRequests int `json:"total_requests"`

	ErrorRequests int `json:"error_requests"`

	UniqueIPs int `json:"unique_ips"`
}
