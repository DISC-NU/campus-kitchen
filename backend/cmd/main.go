package main

import (
	"backend/db"
	"backend/user"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
)

func main() {
	// Load connection string from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("failed to load env", err)
	}

	conn, err := db.Connect()
	if err != nil {
		log.Fatalf("Error to connecting to db: %v", err)
	}
	db.TestConnection(conn)
	defer conn.Close()

	ServerPort := ":3000"
	// Setup server
	r := chi.NewRouter()
	server := http.Server{
		Addr:    ServerPort,
		Handler: setupHandler(r, conn),
	}

	// Graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("Server listening on port %s", ServerPort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not start server: %s", err)
		}
	}()

	<-stop
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced shutdown: %s", err)
	}
	log.Println("Server exited")
}

func setupHandler(r chi.Router, conn *db.DB) chi.Router {
	r.Use(middleware.Logger)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello!"))
	})

	// Register user handlers
	api := user.NewAPI(conn)
	api.RegisterHandlers(r)
	
	return r
}
