package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"siem/internal/events"
	"siem/internal/service"
	"siem/internal/validator"
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
	var eventData events.Event

	// Decode JSON request body
	err := json.NewDecoder(r.Body).Decode(&eventData)
	if err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate log structure
	err = validator.ValidateLog(eventData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Store log in PostgreSQL
	h.service.EnqueueLog(eventData)
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
	fmt.Println("Received and stored log:", eventData)

	// Success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)

	json.NewEncoder(w).Encode(map[string]string{
		"status": "log stored successfully",
	})
}
