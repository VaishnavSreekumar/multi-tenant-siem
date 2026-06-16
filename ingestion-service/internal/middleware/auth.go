package middleware

import (
	"context"
	"net/http"
	"os"


	"siem/internal/auth" 
)

type ContextKey string

const TenantContextKey ContextKey = "tenant_id"

// Notice: The local 'apiKeys' map has been DELETED from here.

func init() {
	// Allow setting a master key via environment variable
	masterKey := os.Getenv("MASTER_API_KEY")
	if masterKey != "" {
		// Use the single source of truth from the auth package
		auth.APIKeys[masterKey] = "admin_tenant"
	}
}

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(
		w http.ResponseWriter,
		r *http.Request,
	) {
		apiKey := r.Header.Get("x-api-key")
		
		// Use auth.APIKeys instead of the old local map
		tenantID, exists := auth.APIKeys[apiKey]
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
