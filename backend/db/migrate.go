package db

import (
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations(dsn string) error {
	m, err := migrate.New("file://./db/migrations/", dsn)
	if err != nil {
		return err
	}
	defer func() {
		sourceErr, databaseErr := m.Close()
		if sourceErr != nil {
			log.Println("Closing migration source failed: ", sourceErr)
		}
		if databaseErr != nil {
			log.Println("Closing migration database failed: ", databaseErr)
		}
		log.Println("Migrations sources closed")
	}()
	err = m.Up()
	if err != nil {
		log.Println("Running migrations: ", err)
	}
	return nil
}
