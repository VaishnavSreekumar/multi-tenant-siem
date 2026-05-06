package queue

import "siem/ingestion-service/internal/model"

// Buffered channel queue
var LogQueue = make(chan model.Log, 1000)
