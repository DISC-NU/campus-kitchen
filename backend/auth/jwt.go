package auth

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/golang-jwt/jwt"
)

// GenerateToken takes a user ID and
func (api API) GenerateToken(userID int) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": userID,
		"exp":    time.Now().Add(time.Duration(api.config.TokenMaxAge) * time.Hour).Unix(),
	})
  log.Println("token", token)
	return token.SignedString([]byte(api.config.JWTTokenSecret))
}

// VerifyToken parses and validates a jwt token. It returns the userID if the token is valid.
func (api API) VerifyToken(tokenString string) (int, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(api.config.JWTTokenSecret), nil
	})

	if err != nil {
		log.Printf("issue parsing token: %v", err)
		return -1, fmt.Errorf("issue parsing token: %w", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, ok := claims["userID"]
		if !ok {
			log.Printf("userID not found in claims: %v", claims)
			return -1, errors.New("invalid token")
		}

		userIDf, ok := userID.(float64)
		if !ok {
			log.Printf("issue parsing userID: %v", userID)
			return -1, fmt.Errorf("issue parsing userID: %w", err)
		}


		userIDInt := int(userIDf)

		return userIDInt, nil
	}
	return -1, errors.New("invalid token")

}
