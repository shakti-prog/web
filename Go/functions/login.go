package functions

import (
	"github.com/gocql/gocql"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

func Login(c *fiber.Ctx, session *gocql.Session) error {
	p := new(userLogin)
	if err := c.BodyParser(p); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	emailLength := len(p.Email)
	passwordLength := len(p.Password)

	if emailLength == 0 || passwordLength == 0 || emailLength > 30 || passwordLength > 30 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Error": "Invalid email or password"})
	}

	var email string
	var password string
	var name string

	query := session.Query(
		"Select email,password,name from userDetails where email=? and password=? ALLOW FILTERING", p.Email, p.Password)

	err := query.Scan(&email, &password, &name)
	if email == "" || password == "" || err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"Error": "Wrong email or password"})
	}

	claims := jwt.MapClaims{
		"email": email,
		"admin": true,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	t, err := token.SignedString([]byte("secret"))

	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Sign In Successfull",
		"token":   t,
		"name":    name})
}
