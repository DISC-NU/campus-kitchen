package auth

import (
	"backend/config"
	"backend/db"
	"backend/endpoint"
	server_error "backend/error"

	// "backend/validator"
	"database/sql"
	"errors"
	// "fmt"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

// API represents a struct for the user API
type API struct {
	q *db.Queries
	// validator *validator.Validate
	config *config.Config
}

func NewAPI(conn *db.DB, config *config.Config) *API {
	q := db.New(conn)
	return &API{
		q:      q,
		config: config,
	}
}

func (api *API) HandleGoogleOauth(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	if query == nil {
		endpoint.WriteWithError(w, http.StatusBadRequest, server_error.ErrMsgInvalidReq)
		return
	}
	code := query.Get("code")
	// pathUrl := "/"

	// if query.Get("state") != "" {
	// pathUrl = query.Get("state")
	// }

	if code == "" {
		endpoint.WriteWithError(w, http.StatusBadRequest, server_error.ErrMsgInvalidReq)
		return
	}
	// log.Println("code", code)
	tokenRes, err := GetGoogleOauthToken(api.config, code)
	if err != nil {
		log.Printf("Failed to get google oauth token: %v", err)
		endpoint.WriteWithError(w, http.StatusInternalServerError, server_error.ErrInternalServerError)
		return
	}
	// log.Println("tokenRes", tokenRes)
	if tokenRes.Access_token == "" || tokenRes.Id_token == "" {
		log.Printf("Failed to get google oauth token: %v", err)
		endpoint.WriteWithError(w, http.StatusInternalServerError, server_error.ErrInternalServerError)
		return
	}
	user, err := GetGoogleUser(tokenRes.Access_token, tokenRes.Id_token)
	if err != nil {
		log.Printf("Failed to get google user: %v", err)
		endpoint.WriteWithError(w, http.StatusInternalServerError, server_error.ErrInternalServerError)
		return
	}
	log.Println("user", user)

	userFromDB, err := api.q.GetUserByEmail(r.Context(), strings.ToLower(user.Email))
	var userID int
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
			userID = int(newUserID)
		} else {
			log.Printf("Failed to get user by email: %v", err)
			endpoint.WriteWithError(w, http.StatusInternalServerError, server_error.ErrInternalServerError)
			return
		}
	} else {
		userID = int(userFromDB.ID)
	}

	token, err := api.GenerateToken(userID)
	if err != nil {
		return
	}
	cookie := http.Cookie{
		Name:   "token",
		Value:  token,
		Path:   "/",
		Domain: "",
		// MaxAge: api.config.TokenMaxAge,
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
		HttpOnly: true,
	}
	log.Println("cookie", cookie)

	http.SetCookie(w, &cookie)

	// attach token to the redirect url
	// redirect_url := fmt.Sprintf("%s?token=%s", api.config.FrontEndOrigin, token)
	http.Redirect(w, r, api.config.FrontEndOrigin, http.StatusFound)

}

func (api *API) RegisterHandlers(r chi.Router) {
	r.Route("/auth/", func(r chi.Router) {
		r.Get("/google/callback", api.HandleGoogleOauth)
	})
}
