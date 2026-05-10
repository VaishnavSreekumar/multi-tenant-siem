package middleware

import (
	"context"
	"math/rand"
	"net/http"
	"time"
)

const RequestIDKey ContextKey = "request_id"

func generateRequestID() string {
	return time.Now().Format("20060102150405") + "-" + string(rune(rand.Intn(10000)))
}

func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := generateRequestID()

		ctx := context.WithValue(r.Context(), RequestIDKey, requestID)
		r = r.WithContext(ctx)

		w.Header().Set("X-Request-ID", requestID)

		next.ServeHTTP(w, r)
	})
}
