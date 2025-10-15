package services

import (
	"fmt"
	"log"

	"backend/models"
	"backend/utils"

	"gorm.io/gorm"
)

func GetServerByID(db *gorm.DB, serverID string) (models.Server, error) {
	var server models.Server
	if result := db.First(&server, "id = ?", serverID); result.Error != nil {
		return models.Server{}, result.Error
	}
	return server, nil
}

func StartComposeApp(server models.Server, composePath string) (string, error) {
	cmd := fmt.Sprintf("cd %s && docker-compose up -d", composePath)
	log.Printf("Executing command on %s: %s", server.Address, cmd)

	out, err := utils.RunSSHCommand(server.SSHUser, server.Address, server.SSHPort, server.SSHPrivateKey, cmd)
	if err != nil {
		log.Printf("Command failed on %s: %v", server.Address, err)
		return "", fmt.Errorf("command failed: %w", err)
	}
	return out, nil
}

func StopComposeApp(server models.Server, composePath string) (string, error) {
	cmd := fmt.Sprintf("cd %s && docker-compose down", composePath)
	out, err := utils.RunSSHCommand(server.SSHUser, server.Address, server.SSHPort, server.SSHPrivateKey, cmd)
	if err != nil {
		return "", fmt.Errorf("command failed: %w", err)
	}
	return out, nil
}

func SSHCommand(server models.Server, command string) (string, error) {
	out, err := utils.RunSSHCommand(server.SSHUser, server.Address, server.SSHPort, server.SSHPrivateKey, command)
	if err != nil {
		return "", fmt.Errorf("command failed: %w", err)
	}
	return out, nil
}