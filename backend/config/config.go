package config

import (
	"backend/validator"
	"log"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	FrontEndOrigin string `mapstructure:"FRONTEND_ORIGIN" validate:"required"`

	JWTTokenSecret string        `mapstructure:"JWT_SECRET" validate:"required"`
	TokenExpiresIn time.Duration `mapstructure:"TOKEN_EXPIRED_IN" validate:"required"`
	TokenMaxAge    int           `mapstructure:"TOKEN_MAXAGE" validate:"required"`

	GoogleClientID         string `mapstructure:"GOOGLE_OAUTH_CLIENT_ID" validate:"required"`
	GoogleClientSecret     string `mapstructure:"GOOGLE_OAUTH_CLIENT_SECRET" validate:"required"`
	GoogleOAuthRedirectUrl string `mapstructure:"GOOGLE_OAUTH_REDIRECT_URL" validate:"required"`

	DbConnectionString          string `mapstructure:"DATABASE_URL" validate:"required"`
	DbMigrationConnectionString string `mapstructure:"DATABASE_URL_MIGRATION" validate:"required"`
}

func LoadConfig(path string, validator *validator.Validate) (config Config) {
	viper.AddConfigPath(path)
	viper.SetConfigType("env")
	viper.SetConfigName("app")

	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}

	err = viper.Unmarshal(&config)
	if err != nil {
		log.Fatalf("Unable to decode into struct, %v", err)
	}

	err = validator.Struct(config)
	if err != nil {
		log.Fatalf("Error validating config, %v", err)
	}

	return config
}
