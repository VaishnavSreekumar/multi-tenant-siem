package middleware

import (
	"net/http"
	"sync"
	"time"
)

type client struct {
	lastSeen time.Time
	requests int
}

var clients = make(map[string]*client)
var mu sync.Mutex

func RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		mu.Lock()
		c, exists := clients[ip]
		if !exists {
			clients[ip] = &client{time.Now(), 1}
			mu.Unlock()
		} else {
			if time.Since(c.lastSeen) > time.Minute {
				c.requests = 0
				c.lastSeen = time.Now()
			}

			c.requests++
			if c.requests > 100 {
				mu.Unlock()
				http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
				return
			}
			mu.Unlock()
		}

		next.ServeHTTP(w, r)
	})
}
