package main

import (
	"backend/auth"
	"backend/config"
	"backend/db"
	"backend/user"
	"backend/validator"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	validator := validator.New()
	config := config.LoadConfig(".", &validator)

	err := db.RunMigrations(config.DbMigrationConnectionString)
	if err != nil {
		log.Fatalf("Error running migrations: %v", err)
	}
	log.Println("Migrations run successfully")

	conn, err := db.Connect(&config)
	if err != nil {
		log.Fatalf("Error to connecting to db: %v", err)
	}
	db.TestConnection(conn)
	defer conn.Close()

	ServerPort := ":8080"
	// Setup server
	r := chi.NewRouter()
	server := http.Server{
		Addr:    ServerPort,
		Handler: setupHandler(r, conn, &validator, &config),
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

func setupHandler(r chi.Router, conn *db.DB, validator *validator.Validate, config *config.Config) chi.Router {
	r.Use(Cors())
	r.Use(middleware.Logger)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello!"))
	})

	auth_api := auth.NewAPI(conn, config)
	auth_guard := auth_api.Auth()
	auth_api.RegisterHandlers(r)
	// Register handlers
	user_api := user.NewAPI(conn, validator)
	user_api.RegisterHandlers(r, auth_guard)

	return r
}

// Cors is a middleware handler that sets the CORS configuration.
func Cors() func(http.Handler) http.Handler {
	return cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Specify the exact origin
		AllowCredentials: true,
	})
}
