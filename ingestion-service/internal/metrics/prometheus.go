package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	KafkaMessagesConsumed = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "kafka_messages_consumed_total",
			Help: "Total number of messages consumed from Kafka",
		},
	)

	EventsProcessed = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "events_processed_total",
			Help: "Total number of events processed by workers",
		},
	)

	AlertsGenerated = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "alerts_generated_total",
			Help: "Total number of security alerts generated",
		},
		[]string{"type", "severity"},
	)

	WorkerQueueDepth = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "worker_queue_depth",
			Help: "Current number of events in the internal worker queue",
		},
	)

	EventProcessingDuration = promauto.NewHistogram(
		prometheus.HistogramOpts{
			Name:    "event_processing_duration_seconds",
			Help:    "Time taken to process a single event batch",
			Buckets: prometheus.DefBuckets,
		},
	)

	WebsocketConnectionsActive = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "websocket_connections_active",
			Help: "Current number of active websocket clients",
		},
	)

	WebsocketBatchesSent = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "websocket_batches_sent_total",
			Help: "Total number of batch payloads sent to websocket clients",
		},
	)
)
