package models

import (
    "time"

    "gorm.io/gorm"
)

type App struct {
    ID              string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    Name            string         `gorm:"not null" json:"name"`
    Domain          string         `gorm:"not null" json:"domain"`
    ComposePath     string         `gorm:"not null" json:"cdPath"`
    ProjectID       string         `gorm:"type:uuid" json:"projectId"`
    ServerID        string         `gorm:"type:uuid" json:"serverId"`
    Server          Server         `gorm:"foreignKey:ServerID" json:"-"`
    AppURL          string         `json:"appUrl"`
    AutoStopTimeout int            `gorm:"column:auto_stop_mins;not null;default:60" json:"autoStopTimeout"`
    Status          string         `gorm:"not null;default:'stopped'" json:"status"`
    StartedAt       *time.Time     `json:"startedAt"`
    TimerEndsAt     *int64         `gorm:"column:timer_ends_at" json:"timerEndsAt"`
    CreatedAt       time.Time      `json:"createdAt"`
    UpdatedAt       time.Time      `json:"updatedAt"`
    DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}
