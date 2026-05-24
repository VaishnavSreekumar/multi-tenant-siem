package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
	"siem/internal/events"
	"siem/internal/metrics"
	"siem/internal/service"
)

const (
	KafkaBroker = "kafka:9092"
	Topic       = "siem-logs"
	GroupID     = "ingestion-service-group"
)

func StartConsumer(ctx context.Context, logService *service.LogService) {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{KafkaBroker},
		GroupID: GroupID,
		Topic:   Topic,
	})
	defer reader.Close()

	fmt.Println("🎧 Kafka Consumer started, listening on topic:", Topic)

	for {
		m, err := reader.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return // Context cancelled, exit gracefully
			}
			log.Printf("❌ Failed to read message from Kafka: %v", err)
			time.Sleep(2 * time.Second) // backoff sleep to prevent tight CPU loop
			continue
		}

		var event events.Event
		if err := json.Unmarshal(m.Value, &event); err != nil {
			log.Printf("❌ Failed to unmarshal Kafka message: %v", err)
			continue
		}

		fmt.Printf("📥 Received event from Kafka: source=%s type=%s\n", event.Source, event.EventType)

		metrics.KafkaMessagesConsumed.Inc()

		// Enqueue for processing just like HTTP ingestion
		logService.EnqueueLog(event)
	}
}
