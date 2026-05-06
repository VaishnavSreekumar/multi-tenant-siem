package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"siem/ingestion-service/internal/model"
	"siem/ingestion-service/internal/service"
	"siem/ingestion-service/internal/validator"
)

type Handler struct {
	service *service.LogService
}

func NewHandler(service *service.LogService) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) IngestLog(w http.ResponseWriter, r *http.Request) {
	var logData model.Log

	// Decode JSON request body
	err := json.NewDecoder(r.Body).Decode(&logData)
	if err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate log structure
	err = validator.ValidateLog(logData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Store log in PostgreSQL
	h.service.EnqueueLog(logData)
	if err != nil {
		fmt.Println("Database error:", err)

		http.Error(
			w,
			"failed to store log",
			http.StatusInternalServerError,
		)

		return
	}

	// Temporary debug print
	fmt.Println("Received and stored log:", logData)

	// Success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)

	json.NewEncoder(w).Encode(map[string]string{
		"status": "log stored successfully",
	})
}
