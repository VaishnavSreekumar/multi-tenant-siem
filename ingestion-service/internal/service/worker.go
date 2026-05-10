package service

import (
	"fmt"

	"siem/internal/detection"
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

	fmt.Printf(
		"Worker %d started\n",
		id,
	)

	for logData := range queue.LogQueue {

		// --------------------------------
		// STORE LOG FIRST
		// --------------------------------

		err := s.ProcessLog(logData)

		if err != nil {

			fmt.Println(
				"Worker DB error:",
				err,
			)

			continue
		}

		fmt.Printf(
			"Worker %d processed log from service=%s\n",
			id,
			logData.Service,
		)

		// --------------------------------
		// SSH BRUTE FORCE DETECTION
		// --------------------------------

		bruteForceAlert := detection.DetectBruteForce(
			logData,
		)

		if bruteForceAlert != nil {

			err := s.alertService.CreateAlert(
				*bruteForceAlert,
			)

			if err != nil {

				fmt.Println(
					"failed to create brute force alert:",
					err,
				)

			} else {

				fmt.Println(
					"🚨 BRUTE_FORCE ALERT CREATED",
				)
			}
		}

		// --------------------------------
		// WEB SCAN DETECTION
		// --------------------------------

		webScanAlert := detection.DetectWebScan(
			logData,
		)

		if webScanAlert != nil {

			err := s.alertService.CreateAlert(
				*webScanAlert,
			)

			if err != nil {

				fmt.Println(
					"failed to create web scan alert:",
					err,
				)

			} else {

				fmt.Println(
					"🚨 WEB_SCAN ALERT CREATED",
				)
			}
		}
	}
}
