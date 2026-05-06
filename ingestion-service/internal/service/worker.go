package service

import (
	"fmt"

	"siem/ingestion-service/internal/detection"
	"siem/ingestion-service/internal/queue"
)

func (s *LogService) StartWorkers(workerCount int) {
	for i := 0; i < workerCount; i++ {
		go s.worker(i)
	}
}

func (s *LogService) worker(id int) {
	fmt.Printf("Worker %d started\n", id)

	for logData := range queue.LogQueue {

		// Run anomaly detection
		detection.DetectBruteForce(logData)

		// Store log in DB
		err := s.ProcessLog(logData)
		if err != nil {
			fmt.Println("Worker DB error:", err)
			continue
		}

		fmt.Printf(
			"Worker %d processed log from service=%s\n",
			id,
			logData.Service,
		)
	}
}
