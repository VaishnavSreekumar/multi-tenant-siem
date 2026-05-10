package middleware

import (
	"context"
	"net/http"
)

type ContextKey string

const TenantContextKey ContextKey = "tenant_id"

var apiKeys = map[string]string{
	"tenant1-secret-key": "tenant_1",
	"tenant2-secret-key": "tenant_2",
}

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(
		w http.ResponseWriter,
		r *http.Request,
	) {
		apiKey := r.Header.Get("x-api-key")
		tenantID, exists := apiKeys[apiKey]
		if !exists {
			http.Error(
				w,
				"unauthorized",
				http.StatusUnauthorized,
			)
			return
		}
		ctx := context.WithValue(
			r.Context(),
			TenantContextKey,
			tenantID,
		)
		next.ServeHTTP(
			w,
			r.WithContext(ctx),
		)
	})
}
