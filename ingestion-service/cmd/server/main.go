package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"

	"siem/internal/db"
	"siem/internal/handler"
	"siem/internal/kafka"
	"siem/internal/middleware"
	"siem/internal/repository"
	"siem/internal/service"
	"siem/internal/websocket"
)

func main() {

	// Initialize database connection
	db.Init()

	// Repositories
	logRepo := repository.NewLogRepository(
		db.DB,
	)

	alertRepo := repository.NewAlertRepository(
		db.DB,
	)

	analyticsRepo := repository.NewAnalyticsRepository(
		db.DB,
	)

	// Services
	alertService := service.NewAlertService(
		alertRepo,
	)

	logService := service.NewLogService(
		logRepo,
		alertService,
	)

	analyticsService := service.NewAnalyticsService(
		analyticsRepo,
	)

	// Start worker pool
	logService.StartWorkers(3)

	// Start Kafka consumer
	go kafka.StartConsumer(context.Background(), logService)

	// Handlers
	logHandler := handler.NewHandler(
		logService,
	)

	alertHandler := handler.NewAlertHandler(
		alertService,
	)

	analyticsHandler := handler.NewAnalyticsHandler(
		analyticsService,
	)

	// Router
	mux := http.NewServeMux()

	// Log ingestion endpoint
	mux.HandleFunc(
		"/logs",
		logHandler.IngestLog,
	)

	// Alerts API
	mux.Handle(
		"/alerts",
		middleware.Auth(
			http.HandlerFunc(
				alertHandler.GetAlerts,
			),
		),
	)

	// Traffic analytics API
	mux.HandleFunc(
		"/analytics/traffic",
		analyticsHandler.GetTrafficAnalytics,
	)

	// Status code analytics API
	mux.HandleFunc(
		"/analytics/status-codes",
		analyticsHandler.GetStatusCodeAnalytics,
	)

	// Top paths analytics API
	mux.HandleFunc(
		"/analytics/top-paths",
		analyticsHandler.GetTopPaths,
	)

	// WebSocket endpoint
	mux.HandleFunc(
		"/ws",
		websocket.WS.HandleConnections,
	)
	mux.HandleFunc(
		"/analytics/attackers",
		analyticsHandler.GetAttackers,
	)

	// Prometheus Metrics endpoint
	mux.Handle("/metrics", promhttp.Handler())

	// Middleware chain
	finalHandler := middleware.CORS(
		middleware.RequestID(
			middleware.Logging(
				middleware.RateLimit(mux),
			),
		),
	)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf(
		"🚀 Server running on port %s\n",
		port,
	)

	// Start server
	err := http.ListenAndServe(
		":"+port,
		finalHandler,
	)

	if err != nil {
		log.Fatal(err)
	}
}
