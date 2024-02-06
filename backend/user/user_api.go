package user

import (
	"backend/db"
	"backend/endpoint"
	"backend/validator"
	"database/sql"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// API represents a struct for the user API
type API struct {
	db        *db.DB
	q         *db.Queries
	validator *validator.Validate
}

// NewAPI initializes an API struct
func NewAPI(conn *db.DB, v *validator.Validate) API {
	q := db.New(conn)
	return API{
		db:        conn,
		q:         q,
		validator: v,
	}
}

type GetUserInput struct {
	ID int32 `json:"id" validate:"required"`
}

// HandleGetUser returns a user by ID
func (api *API) HandleGetUser(w http.ResponseWriter, r *http.Request) {

	var input GetUserInput
	err := endpoint.DecodeAndValidate(w, r, api.validator, &input)
	if err != nil {
		return
	}

	user, err := api.q.GetUser(r.Context(), input.ID)
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
