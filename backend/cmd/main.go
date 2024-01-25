package main

import (
	"fmt"
	"log"
	"net/http"

	"database/sql"

	"github.com/go-chi/chi/v5"
	_ "github.com/lib/pq"
	// "github.com/go-chi/chi/v5/middleware"
)

func connectToDB() *sql.DB {
    connStr := "user=postgres password=postgres dbname=localhost sslmode=disable"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal(err)
    }
	fmt.Println("Connected to DB")
    return db
}

func main() {
	db := connectToDB()
    defer db.Close()

	r := chi.NewRouter()
	// r.Use(middleware.Logger)
	// r.Use(middleware.RequestID)
	// r.Use(middleware.RealIP)
	// r.Use(middleware.Recoverer)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Welcome to the API"))
	})

	fmt.Println("Server running on port 3000")
	
	http.ListenAndServe(":3000", r)
}
