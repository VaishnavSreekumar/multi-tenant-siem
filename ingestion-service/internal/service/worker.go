package service

import (
	"fmt"
	"time"

	"siem/internal/detection"
	"siem/internal/events"
	"siem/internal/metrics"
	"siem/internal/queue"
)

func (s *LogService) StartWorkers(
	workerCount int,
) {

	for i := 0; i < workerCount; i++ {
		go s.worker(i)
	}
}

func (s *LogService) worker(id int) {
	fmt.Printf("Worker %d started\n", id)

	batchSize := 500
	batch := make([]events.Event, 0, batchSize)
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	flush := func() {
		metrics.WorkerQueueDepth.Set(float64(len(queue.LogQueue)))
		
		if len(batch) == 0 {
			return
		}

		startTime := time.Now()
		err := s.repo.InsertLogsBatch(batch)
		duration := time.Since(startTime).Seconds()
		
		if err != nil {
			fmt.Println("Worker batch DB error:", err)
		} else {
			metrics.EventProcessingDuration.Observe(duration)
			metrics.EventsProcessed.Add(float64(len(batch)))
		}

		// Process detection logic for the batch
		for _, logData := range batch {
			bruteForceAlert := detection.DetectBruteForce(logData)
			if bruteForceAlert != nil {
				err := s.alertService.CreateAlert(*bruteForceAlert)
				if err != nil {
					fmt.Println("failed to create brute force alert:", err)
				}
			}

			webScanAlert := detection.DetectWebScan(logData)
			if webScanAlert != nil {
				err := s.alertService.CreateAlert(*webScanAlert)
				if err != nil {
					fmt.Println("failed to create web scan alert:", err)
				}
			}
		}

		batch = batch[:0]
	}

	for {
		select {
		case logData, ok := <-queue.LogQueue:
			if !ok {
				flush()
				return
			}
			batch = append(batch, logData)
			if len(batch) >= batchSize {
				flush()
			}
		case <-ticker.C:
			flush()
		}
	}
}
