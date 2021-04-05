package models

import (
	"errors"
	"strings"
	"table-booking/config"
	"table-booking/mappers"

	"time"

	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
)

type UserModel struct {
	ID                 string      `db:"id, primarykey" json:"id"`
	Email              string      `db:"email" json:"email"`
	OrgId              string      `db:"org_id" json:"orgId"`
	BranchId           string      `db:"branch_id" json:"branchId"`
	BranchName         string      `db:"branch_name" json:"branchName"`
	RoleId             string      `db:"role_id" json:"roleId"`
	RoleName           string      `db:"role_name" json:"roleName"`
	Address            string      `db:"name" json:"address"`
	Contact            string      `db:"contact" json:"contact"`
	Password           []byte      `db:"password" json:"-"`
	ForgotPasswordCode string      `db:"forgot_password" json:"-"`
	LoginCode          string      `db:"login_code" json:"loginCode"`
	Active             bool        `db:"active" json:"-" gorm:"default:true"`
	ConfigId           string      `db:"config_id" json:"configId"`
	Locked             bool        `db:"locked" json:"-" gorm:"default:false"`
	FirstLogin         bool        `db:"first_login" json:"firstLogin" gorm:"default:true"`
	LockedUntil        time.Time   `db:"locked_until" json:"-"`
	Name               string      `db:"name" json:"name"`
	UserName           string      `db:"user_name" json:"userName"`
	UserNameLowerCase  string      `db:"user_name_lower_case" json:"userNameLower"`
	UpdatedAt          time.Time   `db:"updated_at"  gorm:"default:current_timestamp"`
	CreatedAt          time.Time   `db:"created_at" json:"-" gorm:"default:current_timestamp"`
	Role               RoleModel   `gorm:"foreignKey:roleID;references:id"`
	Config             ConfigModel `gorm:"foreignKey:configID;references:id"`
}
type User struct {
}

func (m User) Login(form mappers.LoginForm) (user UserModel, err error) {

	config.GetDB().Where("user_name_lower_case=?", strings.ToLower(form.UserName)).Where("active=?", true).Preload("Role").Preload("Config").First(&user)

	bytePassword := []byte(form.Password)
	byteHashedPassword := []byte(user.Password)

	err = bcrypt.CompareHashAndPassword(byteHashedPassword, bytePassword)

	if err != nil {
		return user, errors.New("invalid password")
	}

	if user.Locked {
		return user, errors.New("user is locked")
	}

	return user, nil
}

func (u User) EmailTaken(email string) (status bool, err error) {
	var user UserModel
	if !config.GetDB().Where("email=?", email).Where("active=?", true).First(&user).RecordNotFound() {

		return false, errors.New("email already taken")
	}
	return true, nil
}

func (u User) Register(user UserModel) (addedUser UserModel, err error) {

	err = config.GetDB().Save(&user).Error
	if err != nil {
		return UserModel{}, err
	}

	return user, err
}

func (u User) GetUserById(userId string) (user UserModel, err error) {
	err = config.GetDB().Where("ID=?", userId).Where("active=?", true).First(&user).Error
	if err != nil {
		return UserModel{}, err
	}

	return user, nil
}

func (u User) GetUserByUsername(userName string) (user UserModel, err error) {
	err = config.GetDB().Where("user_name_lower_case=?", userName).Where("active=?", true).First(&user).Error
	if err != nil {
		return UserModel{}, err
	}

	return user, nil
}

func (u User) GetUserByEmail(email string) (user UserModel, err error) {
	err = config.GetDB().Where("email=?", email).Where("active=?", true).First(&user).Error
	if err != nil {
		return UserModel{}, err
	}

	return user, nil
}

func (u User) GetUserByLoginCode(code string) (user UserModel, err error) {
	err = config.GetDB().Where("login_code=?", code).Where("active=?", true).First(&user).Error
	if err != nil {
		return UserModel{}, err
	}

	return user, nil
}

func (u User) GetUsersByBranchId(branchId string) (users []UserModel, err error) {
	err = config.GetDB().Where("branch_id=?", branchId).Where("active=?", true).Find(&users).Error
	if gorm.IsRecordNotFoundError(err) {
		return []UserModel{}, nil
	}
	if err != nil {
		return []UserModel{}, err
	}

	return users, nil
}

func (u User) GetUsersByOrgIdAndRoleName(orgId string, roleName string) (users []UserModel, err error) {
	err = config.GetDB().Where("org_id=?", orgId).Where("role_name=?", roleName).Where("active=?", true).Find(&users).Error
	if gorm.IsRecordNotFoundError(err) {
		return []UserModel{}, nil
	}
	if err != nil {
		return []UserModel{}, err
	}

	return users, nil
}

func (u User) GetUsersByOrgIdAndRoleId(orgId string, roleId string) (users []UserModel, err error) {
	err = config.GetDB().Where("org_id=?", orgId).Where("role_id=?", roleId).Where("active=?", true).Find(&users).Error
	if gorm.IsRecordNotFoundError(err) {
		return []UserModel{}, nil
	}
	if err != nil {
		return []UserModel{}, err
	}

	return users, nil
}

func (u User) GetUsersByBranchIdAndRoleId(branchId string, roleId string) (users []UserModel, err error) {
	err = config.GetDB().Where("branch_id=?", branchId).Where("role_id=?", roleId).Where("active=?", true).Find(&users).Error
	if gorm.IsRecordNotFoundError(err) {
		return []UserModel{}, nil
	}
	if err != nil {
		return []UserModel{}, err
	}

	return users, nil
}
func (u User) GetUsersByBranchIdAndRoleName(branchId string, roleName string) (users []UserModel, err error) {
	err = config.GetDB().Where("branch_id=?", branchId).Where("role_name=?", roleName).Where("active=?", true).Find(&users).Error
	if gorm.IsRecordNotFoundError(err) {
		return []UserModel{}, nil
	}
	if err != nil {
		return []UserModel{}, err
	}

	return users, nil
}
func (u User) DeleteById(userId string) (user UserModel, err error) {
	err = config.GetDB().Model(&UserModel{}).Where("ID=?", userId).Where("active=?", true).Update("active", false).Error
	if err != nil {
		return UserModel{}, err
	}

	return user, nil
}

func (u User) DeleteByBranchId(branchId string) (user UserModel, err error) {
	err = config.GetDB().Model(&UserModel{}).Where("branch_id=?", branchId).Where("active=?", true).Update("active", false).Error
	if err != nil {
		return UserModel{}, err
	}

	return user, nil
}

func (u User) GetAllActiveUsers() (users []UserModel, err error) {
	err = config.GetDB().Where("active=?", true).Find(&users).Error
	if gorm.IsRecordNotFoundError(err) {
		return []UserModel{}, nil
	}
	if err != nil {
		return []UserModel{}, err
	}

	return users, nil
}
