package user

import (
	"backend/db"
	"backend/endpoint"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// API represents a struct for the user API
type API struct {
	db *db.DB
	q  *db.Queries
}

// NewAPI initializes an API struct
func NewAPI(conn *db.DB) API {
	q := db.New(conn)
	return API{
		db: conn,
		q:  q,
	}
}

type GetUserInput struct {
	ID int32 `json:"id"`
}

// HandleGetUser returns a user by ID
func (api *API) HandleGetUser(w http.ResponseWriter, r *http.Request) {

	var input GetUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	user, err := api.q.GetUser(ctx, input.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			endpoint.WriteWithError(w, http.StatusNotFound, "User not found")
			return
		}
		endpoint.WriteWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	endpoint.WriteWithStatus(w, http.StatusOK, user)
}

func (api *API) RegisterHandlers(r chi.Router) {
	r.Route("/users", func(r chi.Router) {
		r.Get("/", api.HandleGetUser)
	})
}
