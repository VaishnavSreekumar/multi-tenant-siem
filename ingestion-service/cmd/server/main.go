package main

import (
	"fmt"
	"log"
	"net/http"

	"siem/internal/db"
	"siem/internal/handler"
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

	// Middleware chain
	finalHandler := middleware.CORS(
		middleware.RequestID(
			middleware.Logging(
				middleware.RateLimit(mux),
			),
		),
	)

	fmt.Println(
		"🚀 Server running on port 8080",
	)

	// Start server
	err := http.ListenAndServe(
		":8080",
		finalHandler,
	)

	if err != nil {
		log.Fatal(err)
	}
}
