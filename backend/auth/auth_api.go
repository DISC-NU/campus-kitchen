package auth

import (
	"backend/config"
	"backend/db"
	"backend/endpoint"
	server_error "backend/error"
	"backend/validator"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// API represents a struct for the user API
type API struct {
	q         *db.Queries
	validator *validator.Validate
	config    *config.Config
}

func (api *API) HandleGoogleOauth(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	code := query.Get("code")
	pathUrl := "/"

	if query.Get("state") != "" {
		pathUrl = query.Get("state")
	}

	if code == "" {
		endpoint.WriteWithError(w, http.StatusBadRequest, server_error.ErrMsgInvalidReq)
		return
	}

	tokenRes, err := GetGoogleOauthToken(api.config, code)
	if err != nil {
		endpoint.WriteWithError(w, http.StatusInternalServerError, server_error.ErrInternalServerError)
		return
	}

	user, err := GetGoogleUser(tokenRes.Access_token, tokenRes.Id_token)
	if err != nil {
		endpoint.WriteWithError(w, http.StatusInternalServerError, server_error.ErrInternalServerError)
		return
	}

}

func (api *API) RegisterHandlers(r chi.Router) {
	r.Route("/auth/google/redirect", func(r chi.Router) {
		r.Get("/", api.HandleGoogleOauth)
	})
}
