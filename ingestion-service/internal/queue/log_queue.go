package queue

import "siem/internal/model"

// Buffered channel queue
var LogQueue = make(chan model.Log, 1000)
