package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"table-booking/config"
	"table-booking/graph/generated"
	"table-booking/graph/model"
	"table-booking/models"
)

func (r *queryResolver) Users(ctx context.Context, loginCode *string) (users []*model.User, err error) {
	if loginCode != nil {

		loginCodeString := *loginCode
		userObject, getUserError := user.GetUserByLoginCode(loginCodeString)
		if getUserError != nil {
			logger.Error("graphql resolver failed ", getUserError)
			return users, getUserError
		}
		userModel := populateUserModel(userObject)
		users = append(users, &userModel)
		return users, getUserError

	}
	return users, err
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
var logger = config.InitLogger()
var user = new(models.User)

func populateUserModel(userObject models.UserModel) (userModel model.User) {
	userModel.ID = &userObject.ID
	userModel.Name = &userObject.Name
	userModel.Address = &userObject.Address
	userModel.Email = &userObject.Email
	userModel.OrgID = &userObject.OrgId
	userModel.BranchID = &userObject.BranchId
	userModel.BranchName = &userObject.BranchName
	userModel.RoleName = &userObject.RoleName
	userModel.Contact = &userObject.Contact
	userModel.LoginCode = &userObject.LoginCode
	userModel.FirstLogin = &userObject.FirstLogin
	return userModel
}
