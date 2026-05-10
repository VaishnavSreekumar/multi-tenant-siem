package handler

import (
	"encoding/json"
	"net/http"

	"siem/internal/middleware"
	"siem/internal/service"
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

	tenantID, ok := r.Context().Value(
		middleware.TenantContextKey,
	).(string)

	if !ok {

		http.Error(
			w,
			"tenant not found",
			http.StatusUnauthorized,
		)

		return
	}

	if tenantID == "" {

		http.Error(
			w,
			"tenant_id is required",
			http.StatusBadRequest,
		)

		return
	}

	alerts, err := h.service.GetAlerts(tenantID)
	if err != nil {

		http.Error(
			w,
			"failed to fetch alerts",
			http.StatusInternalServerError,
		)

		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(alerts)
}
