package handler

import (
	"encoding/json"
	"net/http"

	"siem/internal/service"
)

type AnalyticsHandler struct {
	service *service.AnalyticsService
}

func NewAnalyticsHandler(
	service *service.AnalyticsService,
) *AnalyticsHandler {

	return &AnalyticsHandler{
		service: service,
	}
}

func (h *AnalyticsHandler) GetTrafficAnalytics(
	w http.ResponseWriter,
	r *http.Request,
) {

	analytics, err := h.service.GetTrafficAnalytics()

	if err != nil {

		http.Error(
			w,
			"failed to fetch analytics",
			http.StatusInternalServerError,
		)

		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(
		analytics,
	)
}

func (h *AnalyticsHandler) GetStatusCodeAnalytics(
	w http.ResponseWriter,
	r *http.Request,
) {

	data, err := h.service.GetStatusCodeAnalytics()

	if err != nil {

		http.Error(
			w,
			"failed to fetch analytics",
			http.StatusInternalServerError,
		)

		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(
		data,
	)
}

func (h *AnalyticsHandler) GetTopPaths(
	w http.ResponseWriter,
	r *http.Request,
) {

	data, err := h.service.GetTopPaths()

	if err != nil {

		http.Error(
			w,
			"failed to fetch top paths",
			http.StatusInternalServerError,
		)

		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(
		data,
	)
}

func (h *AnalyticsHandler) GetAttackers(
	w http.ResponseWriter,
	r *http.Request,
) {

	data, err := h.service.GetAttackers()

	if err != nil {

		http.Error(
			w,
			"failed to fetch attackers",
			http.StatusInternalServerError,
		)

		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(
		data,
	)
}
