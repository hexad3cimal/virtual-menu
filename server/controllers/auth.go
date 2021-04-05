package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthController struct{}

func (ctl AuthController) IstokenValid(c *gin.Context) {

	loginCode, gotCode := c.GetQuery("loginCode")
	if gotCode {

		loggedInUser, getUserError := user.GetUserByLoginCode(loginCode)
		if getUserError != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid login details"})
			c.Abort()
			return
		}
		tokenDetails, tokenError := auth.CreateToken()
		if tokenError == nil {

			tokenModel.BranchId = loggedInUser.BranchId
			tokenModel.Email = loggedInUser.Email
			tokenModel.UserId = loggedInUser.ID
			tokenModel.OrgId = loggedInUser.OrgId
			tokenModel.RoleId = loggedInUser.RoleId
			tokenModel.TimeZone = loggedInUser.Config.TimeZone
			tokenModel.Currency = loggedInUser.Config.Currency
			tokenModel.AccessToken = tokenDetails.AccessToken
			tokenModel.RefreshToken = tokenDetails.RefreshToken
			tokenModel.ID = tokenDetails.AccessUUID
			tokenModel.Valid = true
			_, tokenAddError := token.Add(tokenModel)
			if tokenAddError == nil {
				c.Request.Header.Set("access_uuid", tokenModel.ID)
				c.SetCookie("token", tokenDetails.AccessToken, 60*60*23, "/", "localhost", false, true)
				c.SetCookie("refresh-token", tokenDetails.RefreshToken, 60*60*24, "/", "localhost", false, true)
				c.Next()
				return
			}
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid login details"})

		}
	}
	err := auth.TokenValid(c.Request, false)
	if err != nil {
		logger.Error(err)
		if err.Error() == "token contains an invalid number of segments" {
			AuthController.Refresh(AuthController{}, c)
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid authorization, please login again"})
		c.Abort()
		return
	}
	tokenId, err := auth.ExtractTokenMetadata(c.Request, false)
	if err != nil {
		logger.Error(err)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid authorization, please login again"})
		c.Abort()
		return
	}
	c.Request.Header.Set("access_uuid", tokenId)
}

func (ctl AuthController) Refresh(c *gin.Context) {
	tokenId, err := auth.ExtractTokenMetadata(c.Request, false)
	if err != nil {
		logger.Error(err)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid authorization, please login again"})
		c.Abort()
		return
	}
	oldTokenModel, getTokenError := token.GetTokenById(tokenId)
	if getTokenError != nil {
		logger.Error("invalid access uuid ", c.GetHeader("access_uuid"))

		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid authorization, please login again"})
		c.Abort()
		return
	}
	token.DeleteByAccessToken(tokenModel.AccessToken)

	_, verifyRefreshTokenErr := auth.VerifyToken(c.Request, true)
	if verifyRefreshTokenErr != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid authorization, please login again"})
		c.Abort()
		return
	}

	tokenDetails, createTokenErr := auth.CreateToken()
	if createTokenErr != nil {
		c.JSON(http.StatusNotAcceptable, gin.H{"message": "Invalid refresh token"})
		c.Abort()
		return
	}
	c.JSON(http.StatusNotAcceptable, gin.H{"message": "Invalid refresh token"})
	tokenModel.BranchId = oldTokenModel.BranchId
	tokenModel.Email = oldTokenModel.Email
	tokenModel.UserId = oldTokenModel.UserId
	tokenModel.OrgId = oldTokenModel.OrgId
	tokenModel.RoleId = oldTokenModel.RoleId
	tokenModel.TimeZone = oldTokenModel.TimeZone
	tokenModel.Currency = oldTokenModel.Currency
	tokenModel.AccessToken = tokenDetails.AccessToken
	tokenModel.RefreshToken = tokenDetails.RefreshToken
	tokenModel.ID = tokenDetails.AccessUUID
	tokenModel.Valid = true
	_, tokenAddError := token.Add(tokenModel)
	if tokenAddError == nil {

		c.Request.Header.Set("access_uuid", tokenId)
		c.SetCookie("token", tokenDetails.AccessToken, 300, "/", "localhost", false, true)
		c.Next()
		return
	}
	c.JSON(http.StatusNotAcceptable, gin.H{"message": "Invalid refresh token"})
	c.Abort()
	return
}
