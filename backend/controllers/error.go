package controllers

import (
	"github.com/gin-gonic/gin"
)

// respondWithError sends a standardized JSON error response.
func respondWithError(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{"error": message})
}