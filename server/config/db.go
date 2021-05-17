package config

import (
	"fmt"

	_ "github.com/lib/pq"

	"github.com/jinzhu/gorm"
)

var DB *gorm.DB
var log = InitLogger()

func InitDB() {
	dbString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		GetConfig().Db.Host, GetConfig().Db.Port, GetConfig().Db.UserName, GetConfig().Db.Password, GetConfig().Db.Name)
	db, err := gorm.Open("postgres", dbString)
	if err != nil {
		panic(err)
	}
	db.DB().SetMaxIdleConns(10)
	db.LogMode(true)
	DB = db
}

func GetDB() *gorm.DB {
	return DB
}
