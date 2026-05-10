package parser

import (
	"regexp"
	"strconv"
	"time"

	"siem/log-agent/model"
)

var nginxRegex = regexp.MustCompile(
	`^(.+?) - - \[(.*?)\] "(\w+) (.*?) HTTP.*" (\d+)`,
)

func ParseNginxLog(
	line string,
) (*model.Log, bool) {

	match := nginxRegex.FindStringSubmatch(
		line,
	)

	if len(match) < 6 {
		return nil, false
	}

	ip := match[1]

	method := match[3]

	path := match[4]

	statusCode, err := strconv.Atoi(
		match[5],
	)

	if err != nil {
		return nil, false
	}

	level := "INFO"

	if statusCode >= 400 {
		level = "WARNING"
	}

	logData := &model.Log{
		Timestamp: time.Now().
			UTC().
			Format(time.RFC3339),

		TenantID: "tenant_1",

		Service: "nginx",

		Level: level,

		Message: "HTTP Request",

		Metadata: map[string]interface{}{
			"ip":          ip,
			"method":      method,
			"path":        path,
			"status_code": statusCode,
		},
	}

	return logData, true
}