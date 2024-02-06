package endpoint

import (
	"encoding/json"
	"log"
	"net/http"
)

func WriteWithStatus(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if data != nil {
		if err := json.NewEncoder(w).Encode(data); err != nil {
			log.Printf("Failed to encode API response into JSON: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
		}
	}
}

type errResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

// WriteWithError sets the response header to application/json, writes the header
// with a status code, and returns an error response with a status and mesage
func WriteWithError(w http.ResponseWriter, statusCode int, errMsg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	errResponse := errResponse{
		Status:  statusCode,
		Message: errMsg,
	}
	if err := json.NewEncoder(w).Encode(errResponse); err != nil {
		log.Printf("Failed to encode error response into JSON: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}