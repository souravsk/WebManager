package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"backend/models"
	"backend/services"
)

func ListServers(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var servers []models.Server
		db.Find(&servers)
		c.JSON(http.StatusOK, servers)
	}
}

func CreateServer(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input models.Server
		if err := c.ShouldBindJSON(&input); err != nil {
			respondWithError(c, http.StatusBadRequest, err.Error())
			return
		}

		// Test server connectivity before creating
		services.UpdateServerStatus(&input)

		if err := db.Create(&input).Error; err != nil {
			respondWithError(c, http.StatusInternalServerError, "Failed to create server")
			return
		}

		c.JSON(http.StatusCreated, input)
	}
}

func GetServer(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var server models.Server
		if result := db.First(&server, "id = ?", id); result.Error != nil {
			respondWithError(c, http.StatusNotFound, "Server not found")
			return
		}
		c.JSON(http.StatusOK, server)
	}
}

func UpdateServer(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var server models.Server
		if result := db.First(&server, "id = ?", id); result.Error != nil {
			respondWithError(c, http.StatusNotFound, "Server not found")
			return
		}

		var input models.Server
		if err := c.ShouldBindJSON(&input); err != nil {
			respondWithError(c, http.StatusBadRequest, err.Error())
			return
		}

		db.Model(&server).Updates(input)
		c.JSON(http.StatusOK, server)
	}
}

func DeleteServer(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var server models.Server
		if result := db.First(&server, "id = ?", id); result.Error != nil {
			respondWithError(c, http.StatusNotFound, "Server not found")
			return
		}

		db.Delete(&server)
		c.JSON(http.StatusOK, gin.H{"message": "Server deleted successfully"})
	}
}

func TestServerConnection(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var server models.Server
		if result := db.First(&server, "id = ?", id); result.Error != nil {
			respondWithError(c, http.StatusNotFound, "Server not found")
			return
		}

		// Test the connection and update status
		services.UpdateServerStatus(&server)
		
		// Save the updated status to database
		db.Save(&server)

		c.JSON(http.StatusOK, gin.H{
			"status":           server.Status,
			"runningAppsCount": server.RunningAppsCount,
			"lastChecked":      server.LastChecked,
		})
	}
}

func RefreshAllServers(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var servers []models.Server
		db.Find(&servers)

		for i := range servers {
			services.UpdateServerStatus(&servers[i])
			db.Save(&servers[i])
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "All servers refreshed",
			"servers": servers,
		})
	}
}
