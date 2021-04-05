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

var logger = config.InitLogger()
var user = new(models.User)

func (r *queryResolver) Users(ctx context.Context) (users []*model.User, err error) {
	userObjects, getUsersError := user.GetAllActiveUsers()
	if getUsersError != nil {
		logger.Error("graphql resolver failed ", getUsersError)
	}
	for _, userObject := range userObjects {
		var userModel model.User
		logger.Info(userModel.ID)

		userModel.ID = userObject.ID

		userModel.Address = &userObject.Address
		userModel.Email = &userObject.Email
		userModel.OrgID = &userObject.OrgId
		userModel.BranchID = &userObject.BranchId
		userModel.BranchName = &userObject.BranchName
		userModel.RoleName = &userObject.RoleName
		userModel.Contact = &userObject.Contact
		userModel.LoginCode = &userObject.LoginCode
		userModel.FirstLogin = &userObject.FirstLogin
		users = append(users, &userModel)

	}
	return users, getUsersError
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
