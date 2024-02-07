package db

import (
	"backend/config"
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

type DB struct {
	*sql.DB
}

func Connect(config *config.Config) (*DB, error) {
	db, err := sql.Open("mysql", config.DbConnectionString)
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	return &DB{db}, nil
}

func TestConnection(db *DB) error {
	log.Println("Testing db connection")
	rows, err := db.Query("SHOW TABLES")
	if err != nil {
		log.Fatalf("Failed to query: %v", err)
	}
	defer rows.Close()

	var tableName string
	for rows.Next() {
		if err := rows.Scan(&tableName); err != nil {
			log.Fatalf("Error scanning row: %v", err)
		}
		log.Println(tableName)
	}
	return nil
}
