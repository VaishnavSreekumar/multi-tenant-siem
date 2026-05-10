package parser

import (
	"regexp"
	"strings"
	"time"

	"siem/log-agent/model"
)

var ipRegex = regexp.MustCompile(`from ([a-fA-F0-9:\\.]+)`)

var userRegex = regexp.MustCompile(`for (invalid user )?(\\w+)`)

func ParseAuthLog(line string) (*model.Log, bool) {

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

	log := &model.Log{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		TenantID:  "tenant_1",
		Service:   "ssh",
		Level:     "ERROR",
		Message:   "Failed SSH login",
		Metadata: map[string]interface{}{
			"ip":       ip,
			"username": username,
		},
	}

	return log, true
}
