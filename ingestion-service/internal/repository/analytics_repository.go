package repository

import (
	"database/sql"

	"siem/internal/model"
)

type AnalyticsRepository struct {
	DB *sql.DB
}

func NewAnalyticsRepository(
	db *sql.DB,
) *AnalyticsRepository {

	return &AnalyticsRepository{
		DB: db,
	}
}

func (r *AnalyticsRepository) GetTrafficAnalytics() (
	model.TrafficAnalytics,
	error,
) {

	var analytics model.TrafficAnalytics

	// Total requests
	totalQuery := `
	SELECT COUNT(*)
	FROM logs
	WHERE service = 'nginx'
	`

	err := r.DB.QueryRow(
		totalQuery,
	).Scan(
		&analytics.TotalRequests,
	)

	if err != nil {
		return analytics, err
	}

	// Error requests
	errorQuery := `
	SELECT COUNT(*)
	FROM logs
	WHERE service = 'nginx'
	AND level = 'WARNING'
	`

	err = r.DB.QueryRow(
		errorQuery,
	).Scan(
		&analytics.ErrorRequests,
	)

	if err != nil {
		return analytics, err
	}

	// Unique IPs
	ipQuery := `
	SELECT COUNT(DISTINCT metadata->>'ip')
	FROM logs
	WHERE service = 'nginx'
	`

	err = r.DB.QueryRow(
		ipQuery,
	).Scan(
		&analytics.UniqueIPs,
	)

	if err != nil {
		return analytics, err
	}

	return analytics, nil
}

func (r *AnalyticsRepository) GetStatusCodeAnalytics() (
	[]model.StatusCodeMetric,
	error,
) {

	query := `
	SELECT
		(metadata->>'status_code')::int AS status_code,
		COUNT(*) as count
	FROM logs
	WHERE service = 'nginx'
	GROUP BY status_code
	ORDER BY count DESC
	`

	rows, err := r.DB.Query(
		query,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var metrics []model.StatusCodeMetric

	for rows.Next() {

		var metric model.StatusCodeMetric

		err := rows.Scan(
			&metric.StatusCode,
			&metric.Count,
		)

		if err != nil {
			return nil, err
		}

		metrics = append(
			metrics,
			metric,
		)
	}

	return metrics, nil
}

func (r *AnalyticsRepository) GetTopPaths() (
	[]model.TopPath,
	error,
) {

	query := `
	SELECT
		metadata->>'path' AS path,
		COUNT(*) as count
	FROM logs
	WHERE service = 'nginx'
	GROUP BY path
	ORDER BY count DESC
	LIMIT 10
	`

	rows, err := r.DB.Query(
		query,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var paths []model.TopPath

	for rows.Next() {

		var p model.TopPath

		err := rows.Scan(
			&p.Path,
			&p.Count,
		)

		if err != nil {
			return nil, err
		}

		paths = append(
			paths,
			p,
		)
	}

	return paths, nil
}

func (r *AnalyticsRepository) GetAttackers() (
	[]model.Attacker,
	error,
) {

	query := `
	SELECT
		source_ip,
		COUNT(*) as attack_count,
		MAX(created_at) as last_seen
	FROM alerts
	GROUP BY source_ip
	ORDER BY attack_count DESC
	LIMIT 10
	`

	rows, err := r.DB.Query(
		query,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var attackers []model.Attacker

	for rows.Next() {

		var attacker model.Attacker

		err := rows.Scan(
			&attacker.IP,
			&attacker.AttackCount,
			&attacker.LastSeen,
		)

		if err != nil {
			return nil, err
		}

		// Simple risk scoring
		attacker.RiskScore =
			attacker.AttackCount * 10

		if attacker.RiskScore > 100 {
			attacker.RiskScore = 100
		}

		attackers = append(
			attackers,
			attacker,
		)
	}

	return attackers, nil
}
