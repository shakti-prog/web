package main

import (
	"fmt"
	dbConnection "gofibre/dbConnection"
	"gofibre/functions"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app, session := dbConnection.ConnectToDB()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Post("/login", func(c *fiber.Ctx) error {
		return functions.Login(c, session)
	})

	app.Post("/signUp", func(c *fiber.Ctx) error {
		return functions.SignUp(c, session)
	})

	app.Post("/createSr", func(c *fiber.Ctx) error {
		return functions.CreateNewSr(c, session)
	})

	app.Post("/updateSrStatus/:no/:status/:project", func(c *fiber.Ctx) error {
		return functions.UpdateSrStatus(c, session)
	})

	app.Post("updateSr/:no/:project", func(c *fiber.Ctx) error {
		return functions.UpdateSr(c, session)
	})

	app.Get("/getSrData/:status/:project", func(c *fiber.Ctx) error {
		return functions.GetSrDataForStatus(c, session)
	})

	app.Post("/filterSrData/:project", func(c *fiber.Ctx) error {
		return functions.FilteredData(c, session)
	})

	app.Get("/getSpecificSrData/:id", func(c *fiber.Ctx) error {
		return functions.GetSrDataForId(c, session)
	})

	app.Post("/createWorkSpace/:name", func(c *fiber.Ctx) error {
		return functions.CreateWorkSpace(c, session)
	})

	app.Get("/getAllWorkSpaces", func(c *fiber.Ctx) error {
		return functions.GetAllWorkSpaces(c, session)
	})

	app.Get("/globalSearch/:project/:term", func(c *fiber.Ctx) error {
		return functions.GlobalSearch(c, session)
	})

	err := app.Listen(":9000")
	if err != nil {
		fmt.Println("Failed to start server", err)
	} else {
		fmt.Println("Server started successfully")
	}
	defer session.Close()
}
