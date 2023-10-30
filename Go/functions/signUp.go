package functions

import (
	"github.com/gocql/gocql"
	"github.com/gofiber/fiber/v2"
)

func SignUp(c *fiber.Ctx, session *gocql.Session) error {
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

	query := session.Query(
		"Select email,password from userDetails where email=? and password=? ALLOW FILTERING", p.Email, p.Password)

	query.Scan(&email, &password)
	if email != "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Error": "User with this email already exists  !!!"})
	}

	query = session.Query(
		"INSERT INTO userDetails (email, password) VALUES (?, ?)",
		p.Email,
		p.Password,
	)
	if err := query.Exec(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"Err": "Could not sign up "})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Message": "Sign Up successfully"})
}
