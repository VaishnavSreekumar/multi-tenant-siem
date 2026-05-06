package handler

import (
	"encoding/json"
	"net/http"

	"siem/ingestion-service/internal/service"
)

type AlertHandler struct {
	service *service.AlertService
}

func NewAlertHandler(
	service *service.AlertService,
) *AlertHandler {

	return &AlertHandler{
		service: service,
	}
}

func (h *AlertHandler) GetAlerts(
	w http.ResponseWriter,
	r *http.Request,
) {

	alerts, err := h.service.GetAlerts()
	if err != nil {
		http.Error(
			w,
			"failed to fetch alerts",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(alerts)
}
