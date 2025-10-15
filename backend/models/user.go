package models

import (
    "time"

    "gorm.io/gorm"
)

type User struct {
    ID           string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    Username     string         `gorm:"unique;not null" json:"username"`
    PasswordHash string         `gorm:"not null" json:"-"` // Never expose password hash
    Role         string         `gorm:"not null" json:"role"` // 'admin', 'user'
    Email        string         `gorm:"not null" json:"email"`
    FullName     string         `json:"fullName"`
    IsActive     bool           `gorm:"default:true" json:"isActive"`
    LastLoginAt  *time.Time     `json:"lastLoginAt"`
    CreatedAt    time.Time      `json:"createdAt"`
    UpdatedAt    time.Time      `json:"updatedAt"`
    DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
