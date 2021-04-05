package models

import (
	"table-booking/config"
	"time"
)

type OrderModel struct {
	ID         string           `db:"id, primarykey" json:"id"`
	RefCode    string           `db:"ref_code" json:"refCode"`
	OrgId      string           `db:"org_id" json:"orgId"`
	TableId    string           `db:"table_id" json:"tableId"`
	BranchId   string           `db:"branch_id" json:"branchId"`
	BranchName string           `db:"branch_name" json:"branchName"`
	Price      float32          `db:"price" json:"price"`
	Note       string           `db:"note" json:"note"`
	Status     string           `db:"status" json:"status"`
	Currency   string           `db:"currency" json:"currency"`
	UpdatedAt  time.Time        `db:"updated_at" json:"-" sql:"DEFAULT:current_timestamp"`
	CreatedAt  time.Time        `db:"updated_at" json:"-" sql:"DEFAULT:current_timestamp"`
	OrderItems []OrderItemModel `gorm:"foreignKey:OrderId" json:"orderItems"`
}

type Order struct{}

func (order Order) Add(orderModel OrderModel) (returnModel OrderModel, err error) {

	err = config.GetDB().Save(&orderModel).Error
	if err != nil {
		return OrderModel{}, err
	}

	return orderModel, err
}

func (order Order) Get(id string) (orderModel OrderModel, err error) {

	err = config.GetDB().Preload("OrderItems").Where("id=?", id).First(&orderModel).Error
	if err != nil {

		return OrderModel{}, err
	}

	return orderModel, err
}

func (order Order) GetByTableId(tableId string) (orderModel []OrderModel) {

	config.GetDB().Where("table_id=?", tableId).Preload("OrderItems").Preload("OrderItems.Customisations").Where("status!=?", "complete").Find(&orderModel)

	return orderModel
}

func (order Order) DeleteById(tableId string) (orderModel []OrderModel) {

	config.GetDB().Where("ID=?", tableId).Delete(&orderModel)

	return orderModel
}

func (order Order) GetOrderForOrg(ID string, orgId string) (orderModel OrderModel, err error) {

	err = config.GetDB().Where("ID=?", ID).Preload("OrderItems").Preload("OrderItems.Customisations").Where("org_id=?", orgId).Find(&orderModel).Error
	if err != nil {

		return OrderModel{}, err
	}

	return orderModel, err
}

func (order Order) GetOrdersOfOrg(orgId string) (orderModels []OrderModel) {

	config.GetDB().Where("org_id=?", orgId).Preload("OrderItems").Preload("OrderItems.Customisations").Find(&orderModels)

	return orderModels
}

func (order Order) GetOrdersOfBranch(branchId string) (orderModels []OrderModel) {

	config.GetDB().Where("branch_id=?", branchId).Preload("OrderItems").Preload("OrderItems.Customisations").Find(&orderModels)

	return orderModels
}

func (order Order) GetOpenOrdersOfKitchen(kitchenId string) (orderModels []OrderModel) {

	config.GetDB().Where("kitchen_id=?", kitchenId).Preload("OrderItems").Preload("OrderItems.Customisations").Where("status !=?", "complete").Find(&orderModels)

	return orderModels
}
