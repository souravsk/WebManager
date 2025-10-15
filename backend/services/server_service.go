package services

import (
	"backend/models"
	"backend/utils"
	"fmt"
	"log"
	"net"
	"time"
)

// CheckServerStatus tests connectivity to a server
func CheckServerStatus(server models.Server) (string, error) {
	log.Printf("Testing connection to server %s (%s:%d) with user %s", 
		server.Name, server.Address, server.SSHPort, server.SSHUser)
	
	// Validate required fields
	if server.Address == "" {
		return "offline", fmt.Errorf("server address is empty")
	}
	
	// First, try a basic network connectivity test
	conn, err := net.DialTimeout("tcp", fmt.Sprintf("%s:%d", server.Address, server.SSHPort), 5*time.Second)
	if err != nil {
		log.Printf("Server %s (%s:%d) network connectivity failed: %v", server.Name, server.Address, server.SSHPort, err)
		return "offline", fmt.Errorf("network connectivity failed: %w", err)
	}
	conn.Close()
	
	// If we have SSH credentials, try SSH connection
	if server.SSHUser != "" && server.SSHPrivateKey != "" {
		output, err := utils.RunSSHCommand(server.SSHUser, server.Address, server.SSHPort, server.SSHPrivateKey, "echo 'connection test'")
		if err != nil {
			log.Printf("Server %s (%s) SSH connection failed: %v", server.Name, server.Address, err)
			return "offline", fmt.Errorf("SSH connection failed: %w", err)
		}
		log.Printf("Server %s (%s) is online via SSH. Test output: %s", server.Name, server.Address, output)
		return "online", nil
	}
	
	// If no SSH credentials, just report as online based on network connectivity
	log.Printf("Server %s (%s) is reachable (network only, no SSH test)", server.Name, server.Address)
	return "online", nil
}

// GetRunningContainersCount gets the number of running Docker containers on a server
func GetRunningContainersCount(server models.Server) (int, error) {
	output, err := utils.RunSSHCommand(server.SSHUser, server.Address, server.SSHPort, server.SSHPrivateKey, "docker ps -q | wc -l")
	if err != nil {
		return 0, fmt.Errorf("failed to get container count: %w", err)
	}
	
	var count int
	_, err = fmt.Sscanf(output, "%d", &count)
	if err != nil {
		return 0, fmt.Errorf("failed to parse container count: %w", err)
	}
	
	return count, nil
}

// UpdateServerStatus updates a server's status and running apps count
func UpdateServerStatus(server *models.Server) {
	status, err := CheckServerStatus(*server)
	server.Status = status
	now := time.Now().Unix()
	server.LastChecked = &now
	
	if err == nil && status == "online" {
		// Try to get running containers count
		if count, err := GetRunningContainersCount(*server); err == nil {
			server.RunningAppsCount = count
		}
	} else {
		server.RunningAppsCount = 0
	}
}