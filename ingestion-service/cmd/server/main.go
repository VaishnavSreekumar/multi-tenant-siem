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
	db.Init()

	repo := repository.NewLogRepository(db.DB)
	svc := service.NewLogService(repo)
	svc.StartWorkers(3)
	h := handler.NewHandler(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("/logs", h.IngestLog)

	finalHandler := middleware.RequestID(
		middleware.Logging(
			middleware.RateLimit(mux),
		),
	)

	fmt.Println("Server running on port 8080")

	err := http.ListenAndServe(":8080", finalHandler)
	if err != nil {
		log.Fatal(err)
	}
}
