package mappers

type Product struct {
	ProductId      string   `json:"id" binding:"required"`
	ProductName    string   `json:"name" binding:"required"`
	KitchenId      string   `json:"kitchenId" binding:"required"`
	KitchenName    string   `json:"kitchenName" binding:"required"`
	Price          float32  `json:"price" binding:"required"`
	Cost           float32  `json:"cost" binding:"required"`
	Quantity       int32    `json:"quantity" binding:"required"`
	Customisations []string `json:"customisations"`
}

type OrderForm struct {
	Products []Product `json:"products" binding:"required"`
	TableId  string    `json:"tableId" binding:"required"`
	Status   string    `json:"status"`
	Price    float32   `json:"price" binding:"required"`
	Notes    string    `json:"notes"`
}

type OrderItem struct {
	Id     string `json:"id" binding:"required"`
	Status string `json:"status" binding:"required"`
}
