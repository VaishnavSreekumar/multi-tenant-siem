package sender

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"siem/log-agent/model"
)

const (
	SIEMEndpoint = "http://localhost:8080/logs"
	APIKey       = "tenant1-secret-key"
)

func SendLog(logData model.Log) error {

	jsonData, err := json.Marshal(logData)
	if err != nil {
		return err
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	req, err := http.NewRequest(
		"POST",
		SIEMEndpoint,
		bytes.NewBuffer(jsonData),
	)

	if err != nil {
		return err
	}

	req.Header.Set(
		"Content-Type",
		"application/json",
	)

	req.Header.Set(
		"x-api-key",
		APIKey,
	)

	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusAccepted {

		return fmt.Errorf(
			"failed to send log: status=%d",
			resp.StatusCode,
		)
	}

	fmt.Println(
		"✅ Log sent successfully",
	)

	return nil
}
