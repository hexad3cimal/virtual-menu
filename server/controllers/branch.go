package controllers

import (
	"net/http"
	"strings"
	"table-booking/helpers"
	"table-booking/mappers"
	"table-booking/models"

	"github.com/gin-gonic/gin"
	"github.com/twinj/uuid"
	"golang.org/x/crypto/bcrypt"
)

type BranchController struct{}

func (ctrl BranchController) AddOrEdit(c *gin.Context) {

	tokenModel, getTokenError := token.GetTokenById(c.GetHeader("access_uuid"))
	if getTokenError != nil {
		logger.Error("invalid access uuid ", c.GetHeader("access_uuid"))
		c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
		c.Abort()
		return
	}
	var branchForm mappers.BranchForm
	if c.ShouldBindJSON(&branchForm) != nil {
		logger.Error("invalid branch form ", c.ShouldBindJSON(&branchForm))

		c.JSON(http.StatusNotAcceptable, gin.H{"message": "Invalid request"})
		c.Abort()
		return
	}
	if !branchForm.Edit {
		if !helpers.IsAdmin(c.GetHeader("access_uuid")) {
			logger.Error("Unauthorized operation by " + tokenModel.Email + " branch add")
			c.JSON(http.StatusNotAcceptable, gin.H{"message": "Invalid request"})
			c.Abort()
			return
		}
	}
	if !branchForm.Edit && branchForm.Password == "" {
		logger.Error("Invalid request empty password")
		c.JSON(http.StatusExpectationFailed, gin.H{"message": "Invalid request"})
		c.Abort()
		return
	}
	if !branchForm.Edit {
		userModel.ID = uuid.NewV4().String()
		userModel.ForgotPasswordCode = uuid.NewV4().String()
		userModel.BranchId = uuid.NewV4().String()
		//get branch role for current organisation
		roleModel, roleGetError := role.GetRoleByNameAndOrgId("manager", tokenModel.OrgId)
		if roleGetError != nil {
			logger.Error("Did not get valid manager role for org ", tokenModel.OrgId)

			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}

		//add new user with branch role
		userModel.RoleId = roleModel.ID
		userModel.RoleName = roleModel.Name
		configModel.ID = uuid.NewV4().String()
		userModel.Active = true
		userModel.Locked = false
	} else {
		var getUserError error
		var getConfigError error

		userModel, getUserError = user.GetUserById(tokenModel.UserId)
		if getUserError != nil {
			logger.Error("Did not get valid user for ID ", tokenModel.UserId)
			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}
		if helpers.AdminOrManagerOfTheOrgAndBranch(tokenModel.UserId, branchForm.OrgId, branchForm.BranchId) {
			if helpers.IsAdmin(tokenModel.ID) {
				loggedInUser, getLoggedInUserError := user.GetUserById(tokenModel.UserId)
				if getLoggedInUserError != nil {
					logger.Error("Did not get valid user for ID ", tokenModel.UserId)
					c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
					c.Abort()
					return
				}
				if loggedInUser.OrgId != branchForm.OrgId {
					logger.Error("Admin Not authorized for edititng branch ", tokenModel.UserId)
					c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
					c.Abort()
					return
				}
			} else {
				logger.Error("Admin Not authorized for edititng branch ", tokenModel.UserId)
				c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
				c.Abort()
				return
			}
		}

		configModel, getConfigError = configService.GetByUserId(branchForm.Id)
		if getConfigError != nil {
			logger.Error("Did not get valid config for user ID ", tokenModel.UserId)
			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}
	}
	userModel.Address = branchForm.Address
	userModel.Contact = branchForm.Contact
	userModel.Name = branchForm.Name

	userModel.OrgId = tokenModel.OrgId

	if branchForm.Password != "" {
		bytePassword := []byte(branchForm.Password)
		hashedPassword, err := bcrypt.GenerateFromPassword(bytePassword, bcrypt.DefaultCost)
		if err != nil {
			logger.Error("Failed to hash password ", tokenModel.UserId)
			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}
		userModel.Password = hashedPassword
	}

	userModel.UserName = branchForm.UserName
	userModel.UserNameLowerCase = strings.ToLower(branchForm.UserName)

	userModel.Email = branchForm.Email

	configModel.Currency = branchForm.Currency
	configModel.TimeZone = branchForm.Tz
	configModel.UserId = userModel.ID
	userModel.Config = configModel
	branchUserModel, userError := user.Register(userModel)

	if userError != nil {
		logger.Error("Failed to add or update user ", tokenModel.UserId, userError)

		c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
		c.Abort()
		return
	}

	if !branchForm.Edit {
		//get branch role for current organisation
		kitchenRoleModel, kitchenRoleGetError := role.GetRoleByNameAndOrgId("kitchen", tokenModel.OrgId)
		if kitchenRoleGetError != nil {
			user.DeleteById(userModel.ID)
			logger.Error("Failed to get kitchen role ", tokenModel.UserId, kitchenRoleGetError)

			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}

		categoryModel.ID = uuid.NewV4().String()
		categoryModel.BranchId = branchUserModel.BranchId
		categoryModel.OrgId = tokenModel.OrgId
		categoryModel.Active = true
		categoryModel.Name = "Veg"
		_, addCategoryError := category.Add(categoryModel)

		categoryModel.ID = uuid.NewV4().String()
		categoryModel.Name = "Non Veg"
		_, addCategoryError = category.Add(categoryModel)
		if addCategoryError != nil {
			logger.Error("Failed to add category ", tokenModel.UserId, addCategoryError)
			user.DeleteById(userModel.ID)
			category.DeleteByBranchId(branchUserModel.BranchId)
			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}
		userModel.Name = branchForm.Name
		userModel.UserName = branchForm.UserName + "-kitchen"
		userModel.UserNameLowerCase = strings.ToLower(userModel.UserName)
		userModel.RoleId = kitchenRoleModel.ID
		userModel.RoleName = kitchenRoleModel.Name
		userModel.Email = branchForm.Email
		userModel.Password = branchUserModel.Password
		userModel.ForgotPasswordCode = uuid.NewV4().String()
		userModel.BranchId = branchUserModel.BranchId
		userModel.ID = uuid.NewV4().String()
		configModel.ID = uuid.NewV4().String()
		configModel.Currency = branchForm.Currency
		configModel.TimeZone = branchForm.Tz
		configModel.UserId = userModel.ID
		userModel.Config = configModel
		_, kitchenUserError := user.Register(userModel)

		if kitchenUserError != nil {
			logger.Error("Failed to add kitchen user ", tokenModel.UserId, kitchenUserError)

			user.DeleteById(branchUserModel.ID)
			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}
	}

	orgUser, getOrgUserError := user.GetAdmin(branchUserModel.OrgId)

	if getOrgUserError != nil {
		logger.Error("Failed to update org user ", branchUserModel.OrgId, getOrgUserError)

		user.DeleteById(branchUserModel.ID)
		user.DeleteById(userModel.ID)

		c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
		c.Abort()
		return
	}

	if !orgUser.BranchCreated {
		orgUser.BranchCreated = true
		_, updateUserError := user.Register(orgUser)

		if updateUserError != nil {
			logger.Error("Failed to update org user branch status ", branchUserModel.OrgId, updateUserError)

			user.DeleteById(branchUserModel.ID)
			user.DeleteById(userModel.ID)

			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "success"})
}

func (ctrl BranchController) Delete(c *gin.Context) {
	tokenModel, getTokenError := token.GetTokenById(c.GetHeader("access_uuid"))
	if getTokenError != nil {
		logger.Error("invalid access uuid ", c.GetHeader("access_uuid"))
		c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
		c.Abort()
		return
	}
	if !helpers.AdminOrManagerOfTheOrgAndBranch(tokenModel.UserId, tokenModel.OrgId, tokenModel.BranchId) {
		c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
		c.Abort()
		return
	}
	branchId, gotBranchId := c.GetQuery("id")

	if gotBranchId == true {
		_, _ = user.DeleteByBranchId(branchId)
		c.JSON(http.StatusAccepted, gin.H{"message": "success"})
		c.Abort()
		return
	}
	c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
	c.Abort()
	return
}

func (ctrl BranchController) GetBranchesOfOrg(c *gin.Context) {
	tokenModel, getTokenError := token.GetTokenById(c.GetHeader("access_uuid"))
	if getTokenError != nil {
		logger.Error("invalid access uuid ", c.GetHeader("access_uuid"))
		c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
		c.Abort()
		return
	}
	branches, err := user.GetUsersByOrgIdAndRoleName(tokenModel.OrgId, "manager")
	if err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "success", "data": branches})
	} else {
		c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
	}

}

func (ctrl BranchController) GetBranches(c *gin.Context) {
	tokenModel, getTokenError := token.GetTokenById(c.GetHeader("access_uuid"))
	if getTokenError != nil {
		logger.Error("invalid access uuid ", c.GetHeader("access_uuid"))
		c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
		c.Abort()
		return
	}

	userRoleName, getRoleError := helpers.GetRoleName(tokenModel.UserId, tokenModel.OrgId)

	if getRoleError != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
		c.Abort()
		return
	}
	var branches []models.UserModel
	var error error
	if userRoleName == "admin" {
		branches, error = user.GetUsersByOrgIdAndRoleName(tokenModel.OrgId, "manager")
		if error != nil {
			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}
	} else {

		currentUser, getCurrentUserError := user.GetUserById(tokenModel.UserId)
		if getCurrentUserError != nil {
			c.JSON(http.StatusExpectationFailed, gin.H{"message": "error"})
			c.Abort()
			return
		}
		branches = append(branches, currentUser)

	}
	c.JSON(http.StatusOK, gin.H{"message": "success", "data": branches})

}
