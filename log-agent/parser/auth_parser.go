package parser

import (
	"regexp"
	"strings"
	"time"

	"siem/log-agent/events"
)

var ipRegex = regexp.MustCompile(`from ([a-fA-F0-9:\.]+)`)

var userRegex = regexp.MustCompile(`for (invalid user )?(\w+)`)

func ParseAuthLog(line string) (*events.Event, bool) {

	if !strings.Contains(line, "Failed password") {
		return nil, false
	}

	ipMatch := ipRegex.FindStringSubmatch(line)
	userMatch := userRegex.FindStringSubmatch(line)

	ip := "unknown"
	username := "unknown"

	if len(ipMatch) > 1 {
		ip = ipMatch[1]
	}

	if len(userMatch) > 2 {
		username = userMatch[2]
	}

	event := &events.Event{
		Timestamp: time.Now().UTC(),
		TenantID:  "tenant_1",
		Source:    "ssh",
		EventType: "auth_failure",
		Severity:  "HIGH",
		IPAddress: ip,
		Message:   "Failed SSH login",
		Payload: map[string]interface{}{
			"username": username,
		},
	}

	return event, true
}
