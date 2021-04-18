package mappers

type BranchForm struct {
	Id         string `json:"id"`
	Name       string `json:"name" binding:"required,max=100"`
	UserName   string `json:"newUserName" binding:"required,max=100"`
	Tz         string `json:"tz" binding:"required"`
	Currency   string `json:"currency" binding:"required"`
	BranchId   string `json:"branchId"`
	BranchName string `json:"branchName"`
	Latitude   string `json:"latitude"`
	Longitude  string `json:"longitude"`
	Address    string `json:"address"`
	Email      string `json:"email"`
	Password   string `json:"newPassword"`
	Contact    string `json:"contact"`
	OrgId      string `json:"orgId"`
	Edit       bool   `json:"edit"`
}

type GetBranchForm struct {
	Name  string `json:"name"`
	OrgId string `json:"orgId"`
}
