package tests

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"table-booking/config"
	"table-booking/controllers"
	"table-booking/mappers"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"gopkg.in/go-playground/assert.v1"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	gin.SetMode(gin.TestMode)

	v1 := r.Group("/v1")
	{
		api := new(controllers.UserController)

		v1.POST("/user/login", api.Login)
		v1.POST("/user/register", api.Register)
	}

	return r
}

var loginCookie string

var testEmail = "test@gmail.com"
var testPassword = "123456"

var accessToken string
var refreshToken string

var articleID int

func TestIntDB(t *testing.T) {
	config.InitConfig()
	config.InitDB()
}

func TestRegister(t *testing.T) {
	testRouter := SetupRouter()
	var registerForm mappers.RegisterForm
	registerForm.FullName = "testing"
	registerForm.Email = testEmail
	registerForm.Password = testPassword
	data, _ := json.Marshal(registerForm)
	req, err := http.NewRequest("POST", "/v1/user/register", bytes.NewBufferString(string(data)))
	req.Header.Set("Content-Type", "application/json")
	if err != nil {
		fmt.Println(err)
	}
	resp := httptest.NewRecorder()
	testRouter.ServeHTTP(resp, req)
	assert.Equal(t, http.StatusOK, resp.Code)
}

func main() {
	r := SetupRouter()
	config.InitDB()
	r.Run()
}

var _ = Describe("Repository", func() {
	var mock sqlmock.Sqlmock

	BeforeEach(func() {
		var db *sql.DB
		var err error

		db, mock, err = sqlmock.New() // mock sql.DB
		Expect(err).ShouldNot(HaveOccurred())

		_, err = gorm.Open("postgres", db) // open gorm db
		Expect(err).ShouldNot(HaveOccurred())

	})
	AfterEach(func() {
		err := mock.ExpectationsWereMet() // make sure all expectations were met
		Expect(err).ShouldNot(HaveOccurred())
	})

	It("test something", func() {
	})
})
