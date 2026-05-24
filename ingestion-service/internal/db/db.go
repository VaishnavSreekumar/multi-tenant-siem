package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Init() {
	connStr := os.Getenv("DATABASE_URL")

	if connStr == "" {
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")

		connStr = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			host,
			port,
			user,
			password,
			dbname,
		)
	}

	var err error

	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to open DB:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("Failed to connect DB:", err)
	}

	fmt.Println("Connected to PostgreSQL")

	createTables(DB)
}

func createTables(db *sql.DB) {
	schema := `
	CREATE TABLE IF NOT EXISTS logs (
		id BIGSERIAL PRIMARY KEY,
		timestamp TIMESTAMPTZ NOT NULL,
		tenant_id VARCHAR(50) NOT NULL,
		service VARCHAR(50) NOT NULL,
		level VARCHAR(20) NOT NULL,
		message TEXT NOT NULL,
		metadata JSONB NOT NULL
	);

	CREATE INDEX IF NOT EXISTS idx_logs_tenant_id ON logs(tenant_id);
	CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
	CREATE INDEX IF NOT EXISTS idx_logs_service ON logs(service);

	CREATE TABLE IF NOT EXISTS alerts (
		id BIGSERIAL PRIMARY KEY,
		tenant_id VARCHAR(50) NOT NULL,
		alert_type VARCHAR(50) NOT NULL,
		severity VARCHAR(20) NOT NULL,
		message TEXT NOT NULL,
		source_ip VARCHAR(45) NOT NULL,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_alerts_tenant_id ON alerts(tenant_id);
	CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
	CREATE INDEX IF NOT EXISTS idx_alerts_source_ip ON alerts(source_ip);
	`

	_, err := db.Exec(schema)
	if err != nil {
		log.Fatalf("Failed to initialize database schema: %v", err)
	}
	fmt.Println("Database schema checked/initialized successfully")
}
