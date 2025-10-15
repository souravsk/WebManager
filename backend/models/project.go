package models

import (
    "time"

    "gorm.io/gorm"
)

type Project struct {
    ID          string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    Name        string         `gorm:"unique;not null" json:"name"`
    Description string         `json:"description"`
    CreatedAt   time.Time      `json:"createdAt"`
    UpdatedAt   time.Time      `json:"updatedAt"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
