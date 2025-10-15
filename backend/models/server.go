package models

import (
    "time"

    "gorm.io/gorm"
)

type Server struct {
    ID               string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    Name             string         `gorm:"not null" json:"name"`
    Address          string         `gorm:"not null" json:"address"`
    SSHUser          string         `gorm:"not null" json:"sshUser"`
    SSHPort          int            `gorm:"not null;default:22" json:"sshPort"`
    SSHPrivateKey    string         `gorm:"column:ssh_key_encrypted;not null" json:"sshPrivateKey"`
    Status           string         `gorm:"not null;default:'offline'" json:"status"`
    RunningAppsCount int            `gorm:"-" json:"runningAppsCount"` // Computed field
    LastChecked      *int64         `json:"lastChecked"`
    CreatedAt        time.Time      `json:"createdAt"`
    UpdatedAt        time.Time      `json:"updatedAt"`
    DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
