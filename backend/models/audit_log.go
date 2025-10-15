package models

import (
	"time"

	"gorm.io/gorm"
)

type AuditLog struct {
	ID          string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      string         `gorm:"type:uuid;not null" json:"userId"`
	Username    string         `gorm:"not null" json:"username"`
	Action      string         `gorm:"not null" json:"action"` // "start_app", "stop_app", "create_app", etc.
	ResourceID  string         `gorm:"type:uuid" json:"resourceId"` // App ID, Server ID, etc.
	ResourceType string        `gorm:"not null" json:"resourceType"` // "app", "server", "project"
	ResourceName string        `gorm:"not null" json:"resourceName"` // App name, Server name, etc.
	Details     string         `json:"details"` // Additional details like duration, etc.
	IPAddress   string         `json:"ipAddress"`
	UserAgent   string         `json:"userAgent"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}