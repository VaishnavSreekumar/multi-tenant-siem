package main

import (
	"fmt"
	"log"

	"github.com/hpcloud/tail"

	"siem/log-agent/kafka"
	"siem/log-agent/parser"
	"siem/log-agent/sender"
)

const (
	AuthLogPath  = "test-logs/auth.log"
	NginxLogPath = "test-logs/access.log"
)

func main() {

	fmt.Println(
		"🚀 Starting Multi-Source SIEM Agent",
	)

	// Initialize Kafka Producer
	kafka.InitProducer()
	defer kafka.CloseProducer()

	// Start auth log monitoring
	go monitorAuthLogs()

	// Start nginx log monitoring
	go monitorNginxLogs()

	// Keep app alive
	select {}
}

func monitorAuthLogs() {

	t, err := tail.TailFile(
		AuthLogPath,
		tail.Config{
			Follow: true,
			ReOpen: true,
			Poll:   true,
		},
	)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(
		"📡 Monitoring auth logs:",
		AuthLogPath,
	)

	for line := range t.Lines {

		if line == nil {
			continue
		}

		logData, ok := parser.ParseAuthLog(
			line.Text,
		)

		if !ok {
			continue
		}

		err := sender.SendLog(
			*logData,
		)

		if err != nil {

			fmt.Println(
				"❌ Failed auth send (HTTP):",
				err,
			)
		}

		err = kafka.ProduceLog(*logData)
		if err != nil {
			fmt.Println("❌ Failed auth send (Kafka):", err)
		}
	}
}

func monitorNginxLogs() {

	t, err := tail.TailFile(
		NginxLogPath,
		tail.Config{
			Follow: true,
			ReOpen: true,
			Poll:   true,
		},
	)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(
		"🌐 Monitoring nginx logs:",
		NginxLogPath,
	)

	for line := range t.Lines {

		if line == nil {
			continue
		}

		logData, ok := parser.ParseNginxLog(
			line.Text,
		)

		if !ok {
			continue
		}

		err := sender.SendLog(
			*logData,
		)

		if err != nil {

			fmt.Println(
				"❌ Failed nginx send (HTTP):",
				err,
			)
		}

		err = kafka.ProduceLog(*logData)
		if err != nil {
			fmt.Println("❌ Failed nginx send (Kafka):", err)
		}
	}
}
