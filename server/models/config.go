package models

import (
	"encoding/json"
	"io/ioutil"
	"path/filepath"
	"table-booking/config"
	"time"
)

type ConfigModel struct {
	ID             string    `db:"id, primarykey" json:"id"`
	UserId         string    `db:"user_id" json:"userId"`
	OrgId          string    `db:"org_id" json:"orgId"`
	Currency       string    `db:"currency" json:"currency"`
	TimeZone       string    `db:"timeZone" json:"timeZone"`
	Language       string    `db:"language" json:"language"`
	Country        string    `db:"country" json:"country"`
	PrinterEnabled bool      `db:"printerEnabled" json:"printerEnabled"`
	UpdatedAt      time.Time `db:"updated_at" json:"-" sql:"DEFAULT:current_timestamp"`
	CreatedAt      time.Time `db:"updated_at" json:"-" sql:"DEFAULT:current_timestamp"`
}

type Config struct{}

func (configStruct Config) Add(configModel ConfigModel) (returnModel ConfigModel, err error) {

	err = config.GetDB().Create(&configModel).Error
	if err != nil {
		return ConfigModel{}, err
	}

	return configModel, err
}

func (configStruct Config) DeleteById(id string) (returnModel ConfigModel, err error) {

	err = config.GetDB().Where("id=?", id).Delete(&returnModel).Error

	if err != nil {
		return ConfigModel{}, err
	}

	return returnModel, err
}

func (configStruct Config) GetByUserId(id string) (returnModel ConfigModel, err error) {

	err = config.GetDB().Where("user_id=?", id).First(&returnModel).Error

	return returnModel, err
}

func (configStruct Config) GetConfigByOrgId(orgId string) (configModel ConfigModel, err error) {

	err = config.GetDB().Where("org_id=?", orgId).First(&configModel).Error
	if err != nil {

		return ConfigModel{}, err
	}

	return configModel, err
}
func (configStruct Config) GetCurrencies() (currencies interface{}, err error) {

	filepath, _ := filepath.Abs("../server/config/currency.json")
	currencyJsonStream, _ := ioutil.ReadFile(filepath)

	err = json.Unmarshal(currencyJsonStream, &currencies)

	return currencies, err
}
