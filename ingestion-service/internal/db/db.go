package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Init() {
	connStr := "host=localhost port=5433 user=admin password=root dbname=siem sslmode=disable"

	var err error
	fmt.Println(connStr)
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to open DB:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("Failed to connect DB:", err)
	}

	fmt.Println("Connected to PostgreSQL")
}
