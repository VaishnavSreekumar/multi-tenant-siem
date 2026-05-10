package service

import (
	"siem/internal/model"
	"siem/internal/repository"
)

type AnalyticsService struct {
	repo *repository.AnalyticsRepository
}

func NewAnalyticsService(
	repo *repository.AnalyticsRepository,
) *AnalyticsService {

	return &AnalyticsService{
		repo: repo,
	}
}

func (s *AnalyticsService) GetTrafficAnalytics() (
	model.TrafficAnalytics,
	error,
) {

	return s.repo.GetTrafficAnalytics()
}

func (s *AnalyticsService) GetStatusCodeAnalytics() (
	[]model.StatusCodeMetric,
	error,
) {

	return s.repo.GetStatusCodeAnalytics()
}

func (s *AnalyticsService) GetAttackers() (
	[]model.Attacker,
	error,
) {

	return s.repo.GetAttackers()
}
