package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/segmentio/kafka-go"
	"siem/log-agent/events"
)

const (
	KafkaBroker = "localhost:29092"
	Topic       = "siem-logs"
)

var writer *kafka.Writer

func InitProducer() {
	writer = &kafka.Writer{
		Addr:                   kafka.TCP(KafkaBroker),
		Topic:                  Topic,
		Balancer:               &kafka.LeastBytes{},
		BatchTimeout:           50 * time.Millisecond,
		AllowAutoTopicCreation: true,
	}
	fmt.Println("✅ Kafka Producer initialized for topic:", Topic)
}

func ProduceLog(event events.Event) error {
	if writer == nil {
		return fmt.Errorf("kafka producer not initialized")
	}

	jsonData, err := json.Marshal(event)
	if err != nil {
		return err
	}

	msg := kafka.Message{
		Key:   []byte(event.TenantID),
		Value: jsonData,
		Time:  time.Now(),
	}

	err = writer.WriteMessages(context.Background(), msg)
	if err != nil {
		return fmt.Errorf("failed to write message to kafka: %v", err)
	}

	return nil
}

func CloseProducer() {
	if writer != nil {
		writer.Close()
	}
}
