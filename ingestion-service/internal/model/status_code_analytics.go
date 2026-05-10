package model

type StatusCodeMetric struct {
	StatusCode int `json:"status_code"`

	Count int `json:"count"`
}
