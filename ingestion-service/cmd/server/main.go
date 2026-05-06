package main

import (
	"fmt"
	"log"
	"net/http"

	"siem/ingestion-service/internal/db"
	"siem/ingestion-service/internal/handler"
	"siem/ingestion-service/internal/middleware"
	"siem/ingestion-service/internal/repository"
	"siem/ingestion-service/internal/service"
)

func main() {

	// Initialize database connection
	db.Init()

	// Repositories
	logRepo := repository.NewLogRepository(db.DB)
	alertRepo := repository.NewAlertRepository(db.DB)

	// Services
	alertService := service.NewAlertService(alertRepo)

	logService := service.NewLogService(
		logRepo,
		alertService,
	)

	// Start worker pool
	logService.StartWorkers(3)

	// Handlers
	h := handler.NewHandler(logService)
	alertHandler := handler.NewAlertHandler(alertService)

	// Routes
	mux := http.NewServeMux()
	mux.HandleFunc("/logs", h.IngestLog)
	mux.HandleFunc("/alerts", alertHandler.GetAlerts)

	// Middleware chain
	finalHandler := middleware.RequestID(
		middleware.Logging(
			middleware.RateLimit(mux),
		),
	)

	fmt.Println("Server running on port 8080")

	// Start HTTP server
	err := http.ListenAndServe(":8080", finalHandler)
	if err != nil {
		log.Fatal(err)
	}
}
