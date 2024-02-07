package auth

import (
	"backend/config"
	"backend/db"
	"backend/endpoint"
	server_error "backend/error"
	// "backend/validator"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

// API represents a struct for the user API
type API struct {
	q         *db.Queries
	// validator *validator.Validate
	config    *config.Config
}

func (api *API) HandleGoogleOauth(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	if query == nil {
		endpoint.WriteWithError(w, http.StatusBadRequest, server_error.ErrMsgInvalidReq)
		return
	}
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

	userFromDB, err := api.q.GetUserByEmail(r.Context(), strings.ToLower(user.Email))
	var userID int64
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			res, err := api.q.CreateUser(r.Context(), db.CreateUserParams{
				Email: strings.ToLower(user.Email),
				Name:  user.Name,
				Type:  db.UsersTypeVolunteer,
			})
			if err != nil {
				log.Printf("Failed to create user: %v", err)
				endpoint.WriteWithError(w, http.StatusInternalServerError, server_error.ErrInternalServerError)
				return
			}

			newUserID, err := res.LastInsertId()
			if err != nil {
				log.Printf("Failed to get last inserted user id: %v", err)
				endpoint.WriteWithError(w, http.StatusInternalServerError, server_error.ErrInternalServerError)
				return
			}
			userID = newUserID
		} else {
			log.Printf("Failed to get user by email: %v", err)
			endpoint.WriteWithError(w, http.StatusInternalServerError, server_error.ErrInternalServerError)
			return
		}
	} else {
		userID = int64(userFromDB.ID)
	}

	token, err := GenerateToken(api.config.TokenExpiresIn, userID, api.config.JWTTokenSecret)
	if err != nil {
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		MaxAge:   api.config.TokenMaxAge * 60,
		Path:     "/",
		Domain:   "localhost",
		Secure:   false,
		HttpOnly: true,
	})

	http.Redirect(w, r, fmt.Sprint(api.config.FrontEndOrigin, pathUrl), http.StatusTemporaryRedirect)

}

func (api *API) RegisterHandlers(r chi.Router) {
	r.Route("/auth/google/redirect", func(r chi.Router) {
		r.Get("/", api.HandleGoogleOauth)
	})
}
