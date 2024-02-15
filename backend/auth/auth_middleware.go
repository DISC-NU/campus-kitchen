package auth

import (
	"backend/endpoint"
	"context"
	"errors"
	"log"
	"net/http"
	"strings"
)

type userID int

const (
	keyUserID userID = 0

	errMsgMissingToken = "Missing bearer token."
	errMsgInvalidToken = "Token is invalid."
)

// Auth creates a middleware function that retrieves a bearer token and validates the token.
// The middleware sets the userID in the jwt payload into the request context. If the token is
// invalid, it will write an Unauthorized response.
func (api API) Auth() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			// logger := logger.FromContext(ctx)
			// authHeader := r.Header.Get("Authorization")
			// get from cookie 
			log.Println(r.Cookies())
			token, err := r.Cookie("token")
			if err != nil {
				log.Printf("handler: issue getting token from cookie: %v", err)
				endpoint.WriteWithError(w, http.StatusUnauthorized, errMsgMissingToken)
				return
			}
			token_int := strings.Split(token.String(), "=")[1]
			userID, err := api.VerifyToken(token_int)
			if err != nil {
				log.Printf("handler: issue verifying jwt token: %v", err)
				endpoint.WriteWithError(w, http.StatusUnauthorized, errMsgInvalidToken)
				return
			}
			r = r.WithContext(withUser(ctx, userID))
			next.ServeHTTP(w, r)
		})
	}
}

// UserIDFromContext returns a user ID from context
func UserIDFromContext(ctx context.Context) (int, error) {
	if userID, ok := ctx.Value(keyUserID).(int); ok {
		return userID, nil
	}

	return 0, errors.New("user id not found in context")
}

// withUser adds the userID to a context object and returns that context
func withUser(ctx context.Context, userID int) context.Context {
	return context.WithValue(ctx, keyUserID, userID)
}
