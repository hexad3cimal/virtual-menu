package models

import (
	"table-booking/config"

	"time"
)

type TokenModel struct {
	ID           string    `db:"id, primarykey" json:"id"`
	Email        string    `db:"email" json:"email"`
	OrgId        string    `db:"org_id" json:"orgId"`
	BranchId     string    `db:"branch_id" json:"branchId"`
	RoleId       string    `db:"role_id" json:"roleId"`
	UserId       string    `db:"user_id" json:"userId"`
	Currency     string    `db:"currency" json:"currency"`
	TimeZone     string    `db:"time_zone" json:"timeZone"`
	RefreshToken string    `db:"refresh_token" json:"refreshToken"`
	AccessToken  string    `db:"access_token" json:"accessToken"`
	Valid        bool      `db:"valid" json:"valid" sql:"DEFAULT:true"`
	UpdatedAt    time.Time `db:"created_at" json:"-" sql:"DEFAULT:current_timestamp"`
	CreatedAt    time.Time `db:"updated_at" json:"-" sql:"DEFAULT:current_timestamp"`
}
type Token struct {
}

func (u Token) Add(token TokenModel) (addedToken TokenModel, err error) {

	err = config.GetDB().Create(&token).Error
	if err != nil {
		return TokenModel{}, err
	}

	return token, err
}

func (u Token) GetTokenById(tokenId string) (token TokenModel, err error) {
	err = config.GetDB().Where("ID=?", tokenId).Where("valid=?", true).First(&token).Error
	if err != nil {
		return TokenModel{}, err
	}

	return token, nil
}

func (u Token) DeleteByAccessToken(tokenId string) (token TokenModel, err error) {
	err = config.GetDB().Model(&TokenModel{}).Where("access_token=?", tokenId).Update("valid", false).Error
	if err != nil {
		return TokenModel{}, err
	}

	return token, nil
}
