package model

import "time"

type Attacker struct {
	IP string `json:"ip"`

	AttackCount int `json:"attack_count"`

	LastSeen time.Time `json:"last_seen"`

	RiskScore int `json:"risk_score"`
}
