package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"backend/migrations"
	"backend/models"
	"backend/router"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Initialize database with retry logic
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "postgres://devuser:devpassword@localhost:5432/devops_dashboard?sslmode=disable"
	}
	
	var db *gorm.DB
	var err error
	maxRetries := 30
	for i := 0; i < maxRetries; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("Successfully connected to database")
			break
		}
		log.Printf("Failed to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
		if i < maxRetries-1 {
			log.Println("Retrying in 2 seconds...")
			time.Sleep(2 * time.Second)
		}
	}
	if err != nil {
		log.Fatalf("Failed to connect to database after %d attempts: %v", maxRetries, err)
	}

	// Auto-migrate models
	db.AutoMigrate(&models.User{}, &models.Server{}, &models.Project{}, &models.App{}, &models.AuditLog{})

	// Run migrations
	if err := migrations.CreateDefaultUsers(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Set Gin to production mode in production
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Setup router with all routes and middleware
	r := router.SetupRouter(db)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}
