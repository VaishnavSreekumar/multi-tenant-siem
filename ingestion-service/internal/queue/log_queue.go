package queue

import "siem/internal/events"

// Buffered channel queue
var LogQueue = make(chan events.Event, 1000)
