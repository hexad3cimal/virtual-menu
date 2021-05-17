package router

import (
	"net/http"
	"table-booking/config"
	"table-booking/controllers"
	"table-booking/graph"
	"table-booking/graph/generated"
	"table-booking/helpers"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	helmet "github.com/danielkov/gin-helmet"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/twinj/uuid"
)

func generateContextId() gin.HandlerFunc {
	return func(c *gin.Context) {
		contextId := uuid.NewV4()
		c.Writer.Header().Set("X-Context-Id", contextId.String())
		c.Next()
	}
}

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding, x-access-token")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
		}
		c.Next()
	}
}

var auth = new(controllers.AuthController)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth.IstokenValid(c)
		c.Next()
	}
}

func isAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		isAdmin := helpers.IsAdmin(c.GetHeader("access_uuid"))
		if isAdmin == true {
			c.Next()
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid authorization"})
		c.Abort()
		return
	}
}

func graphqlHandler() gin.HandlerFunc {

	h := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

// Defining the Playground handler
func playgroundHandler() gin.HandlerFunc {
	h := playground.Handler("GraphQL", "/v1/api/query")

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

func InitRouter() {

	router := gin.Default()
	router.Use(CORS())
	router.Use(helmet.Default())
	router.Use(generateContextId())
	router.Use(gzip.Gzip(gzip.DefaultCompression))

	router.Use(static.Serve("/", static.LocalFile(config.GetConfig().Ui, true)))

	v1 := router.Group("/v1/api")
	{

		v1.POST("/query", AuthMiddleware(), graphqlHandler())
		v1.GET("/play", playgroundHandler())

		//user related routes
		user := new(controllers.UserController)
		v1.POST("/user/login", user.Login)
		v1.POST("/user/register", user.Register)
		v1.GET("/token/refresh", auth.Refresh)
		v1.GET("/token/_", auth.IstokenValid)
		v1.GET("/user/validate", user.Validate)
		v1.GET("/user/auth/validate", AuthMiddleware(), user.Validate)
		v1.GET("/user/logout", AuthMiddleware(), user.Logout)
		v1.PUT("/user", AuthMiddleware(), user.Update)

		config := new(controllers.ConfigController)
		v1.PUT("/config", AuthMiddleware(), config.Add)
		v1.GET("/config/tzs", AuthMiddleware(), config.GetTimezones)
		v1.GET("/config/currency", AuthMiddleware(), config.GetCurrencies)

		//table related routes
		table := new(controllers.TableController)
		v1.POST("/table", AuthMiddleware(), table.AddOrEdit)
		v1.GET("/tables", AuthMiddleware(), table.GetTables)
		v1.GET("/table", AuthMiddleware(), table.GetTable)
		v1.PUT("/table", AuthMiddleware(), user.Update)
		v1.DELETE("/table", AuthMiddleware(), table.Delete)

		//branch related routes
		branch := new(controllers.BranchController)
		v1.POST("/branch", AuthMiddleware(), branch.AddOrEdit)
		v1.DELETE("/branch", AuthMiddleware(), branch.Delete)
		v1.GET("/branches", AuthMiddleware(), branch.GetBranches)
		v1.GET("/branch/org", AuthMiddleware(), isAdminMiddleware(), branch.GetBranchesOfOrg)

		product := new(controllers.ProductController)
		v1.POST("/product", AuthMiddleware(), product.AddOrEdit)
		v1.DELETE("/product", AuthMiddleware(), product.Delete)
		v1.GET("/products", AuthMiddleware(), product.GetProducts)
		v1.GET("/product/top", AuthMiddleware(), product.GetTopProducts)
		v1.GET("/product/validate", AuthMiddleware(), product.ValidateProduct)

		tag := new(controllers.TagController)
		v1.GET("/tag", AuthMiddleware(), tag.GetSimilarTags)
		v1.GET("/tags", AuthMiddleware(), tag.GetTags)

		catergory := new(controllers.CategoryController)
		v1.GET("/catergory", AuthMiddleware(), catergory.GetCategories)

		dashboard := new(controllers.DashBoardController)
		v1.GET("/dashboard/stats", AuthMiddleware(), dashboard.GetStats)

		order := new(controllers.OrderController)
		v1.POST("/order", AuthMiddleware(), order.Add)
		v1.GET("/order", AuthMiddleware(), order.GetOrdersOfTable)
		v1.GET("/orders", AuthMiddleware(), order.GetOrders)
		v1.PUT("/order/item", AuthMiddleware(), order.UpdateOrderItem)

		kitchen := new(controllers.KitchenController)
		v1.POST("/kitchen", AuthMiddleware(), kitchen.AddOrEdit)
		v1.DELETE("/kitchen", AuthMiddleware(), kitchen.Delete)
		v1.GET("/kitchens", AuthMiddleware(), kitchen.GetKitchens)
	}

	socket := new(controllers.SocketController)

	router.Any("/events", AuthMiddleware(), socket.Handle)
	router.Run(":" + config.GetConfig().Port)
	//for react
	router.NoRoute(func(c *gin.Context) {
		c.File("../frontend/build/index.html")
	})
}
