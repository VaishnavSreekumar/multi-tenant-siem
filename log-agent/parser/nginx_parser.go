package parser

import (
	"regexp"
	"strconv"
	"time"

	"siem/log-agent/events"
)

var nginxRegex = regexp.MustCompile(
	`^(.+?) - - \[(.*?)\] "(\w+) (.*?) HTTP.*" (\d+)`,
)

func ParseNginxLog(line string) (*events.Event, bool) {

	match := nginxRegex.FindStringSubmatch(line)

	if len(match) < 6 {
		return nil, false
	}

	ip := match[1]
	method := match[3]
	path := match[4]
	statusCode, err := strconv.Atoi(match[5])

	if err != nil {
		return nil, false
	}

	severity := "LOW"
	if statusCode >= 400 {
		severity = "MEDIUM"
	}

	event := &events.Event{
		Timestamp: time.Now().UTC(),
		TenantID:  "tenant_1",
		Source:    "nginx",
		EventType: "http_access",
		Severity:  severity,
		IPAddress: ip,
		Message:   "HTTP Request",
		Payload: map[string]interface{}{
			"method":      method,
			"path":        path,
			"status_code": statusCode,
		},
	}

	return event, true
}