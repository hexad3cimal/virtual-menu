package models

import (
	"table-booking/config"
	"time"
)

type ProductModel struct {
	ID             string                `db:"id, primarykey" json:"id"`
	OrgId          string                `db:"org_id" json:"orgId"`
	BranchId       string                `db:"branch_id" json:"branchId"`
	BranchName     string                `db:"branch_name" json:"branchName"`
	KitchenId      string                `db:"kitchen_id" json:"kitchenId"`
	KitchenName    string                `db:"kitchen_name" json:"kitchenName"`
	CategoryId     string                `db:"category_id" json:"categoryId"`
	Name           string                `db:"name" json:"name"`
	NameLower      string                `db:"name_lower" json:"name_lower"`
	Quantity       int                   `db:"quantity" json:"quantity"`
	Price          float32               `db:"price" json:"price"`
	Discount       int                   `db:"discount" json:"discount"`
	Description    string                `db:"description" json:"description"`
	Image          string                `db:"image" json:"image"`
	Currency       string                `db:"currency" json:"currency"`
	Highlight      bool                  `db:"highlight" json:"highlight"`
	Active         bool                  `db:"active" json:"active" sql:"DEFAULT:true"`
	UpdatedAt      time.Time             `db:"updated_at" json:"-" sql:"DEFAULT:current_timestamp"`
	CreatedAt      time.Time             `db:"created_at" json:"-" sql:"DEFAULT:current_timestamp"`
	Tags           []TagModel            `gorm:"many2many:product_tags;" json:"tags"`
	Catergory      CategoryModel         `json:"catergory"`
	Customisations []CustomisationsModel `gorm:"ForeignKey:ProductId" json:"customisation"`
}

type Product struct{}

func (product Product) Add(productModel ProductModel) (returnModel ProductModel, err error) {

	err = config.GetDB().Save(&productModel).Error
	if err != nil {
		return ProductModel{}, err
	}
	err = config.GetDB().Model(&productModel).Association("Customisations").Append(productModel.Customisations).Error
	if err != nil {
		config.GetDB().Where("id=?", productModel.ID).Delete(&returnModel)
		return ProductModel{}, err
	}
	return productModel, err
}

func (product Product) GetMostOrderedProductsOfBranch(branchId string) (returnModel []ProductModel, err error) {

	err = config.GetDB().Raw("SELECT product_models.*,count(product_models.id) as productCount 	FROM product_models join order_item_models on product_models.id = order_item_models.product_id WHERE product_models.branch_id = ? AND product_models.active = true GROUP BY product_models.id ORDER BY productCount desc LIMIT 10", branchId).Find(&returnModel).Error
	if err != nil {

		return []ProductModel{}, err
	}
	return returnModel, err
}
func (product Product) GetRecentlyOrderedProductsOfBranch(branchId string) (returnModel []ProductModel, err error) {

	err = config.GetDB().Limit(10).Table("product_models").Joins("join order_models on product_models.id =  order_models.product_id").Where("product_models.branch_id = ?", branchId).Where("product_models.active = ?", true).Where("order_models.created_at BETWEEN ? AND ?", time.Now(), time.Now().AddDate(0, 0, -1)).Order("order_models.created_at").Find(&returnModel).Error
	if err != nil {

		return []ProductModel{}, err
	}
	return returnModel, err
}

func (product Product) GetById(id string) (productModel ProductModel, err error) {

	err = config.GetDB().Where("id=?", id).Where("active=?", true).First(&productModel).Error
	if err != nil {

		return ProductModel{}, err
	}

	return productModel, err
}

func (product Product) GetByNameAndBranchId(name string, branchId string) (productModel ProductModel, err error) {

	err = config.GetDB().Where("name_lower=?", name).Where("branch_id=?", branchId).Where("active=?", true).First(&productModel).Error
	if err != nil {

		return ProductModel{}, err
	}

	return productModel, err
}

func (product Product) GetProductForOrg(ID string, orgId string) (productModel ProductModel, err error) {

	err = config.GetDB().Where("ID=?", ID).Where("orgId=?", orgId).Where("active=?", true).First(&productModel).Error
	if err != nil {

		return ProductModel{}, err
	}

	return productModel, err
}

func (product Product) GetProductsOfBranch(branchId string) (productModels []ProductModel, err error) {

	err = config.GetDB().Preload("Customisations").Preload("Tags").Where("branch_id=?", branchId).Where("active=?", true).Find(&productModels).Error
	if err != nil {

		return []ProductModel{}, err
	}

	return productModels, err
}

func (product Product) GetProductsOfOrg(orgId string) (productModels []ProductModel, err error) {

	err = config.GetDB().Preload("Customisations").Preload("Tags").Where("org_id=?", orgId).Where("active=?", true).Find(&productModels).Error
	if err != nil {

		return []ProductModel{}, err
	}

	return productModels, err
}

func (product Product) DeleteById(id string) (productModel ProductModel, err error) {
	err = config.GetDB().Model(&ProductModel{}).Where("id=?", id).Where("active=?", true).Update("active", false).Error
	if err != nil {
		return ProductModel{}, err
	}

	return productModel, nil
}
