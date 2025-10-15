package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"strings"
	"os"
)

func JWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid token"})
			c.Abort()
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "YOUR_SECRET_KEY" // Fallback for development
		}
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid JWT claims"})
			c.Abort()
			return
		}
		c.Set("user", claims)
		c.Set("username", claims["username"])
		c.Next()
	}
}

// Only allow admins
func Admin() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "No user context"})
			c.Abort()
			return
		}
		if claims.(jwt.MapClaims)["role"] != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: admin only"})
			c.Abort()
			return
		}
		c.Next()
	}
}
