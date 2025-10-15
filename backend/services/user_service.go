package services

import (
	"backend/models"
	"backend/utils"
	"gorm.io/gorm"
)

// CreateDefaultAdmin creates default users if no users exist
func CreateDefaultAdmin(db *gorm.DB) error {
	var count int64
	db.Model(&models.User{}).Count(&count)
	
	// If there are already users, don't create default users
	if count > 0 {
		return nil
	}

	// Create default users
	defaultUsers := []struct {
		username string
		password string
		email    string
		role     string
	}{
		{"admin", "admin123", "admin@example.com", "admin"},
		{"devops", "devops123", "devops@example.com", "user"},
		{"user", "user123", "user@example.com", "user"},
	}

	for _, userData := range defaultUsers {
		// Hash the password
		hashedPassword, err := utils.HashPassword(userData.password)
		if err != nil {
			return err
		}

		// Create user
		user := models.User{
			Username:     userData.username,
			Email:        userData.email,
			PasswordHash: hashedPassword,
			Role:         userData.role,
		}

		if err := db.Create(&user).Error; err != nil {
			return err
		}
	}

	return nil
}