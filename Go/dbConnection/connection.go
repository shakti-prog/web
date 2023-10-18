package dbconnection

import (
	"fmt"
	"github.com/gocql/gocql"
	"github.com/gofiber/fiber/v2"
)

func ConnectToDB() (*fiber.App, *gocql.Session) {
	app := fiber.New()
	// Connect to Cassandra
	cluster := gocql.NewCluster("127.0.0.1:9042")
	cluster.Keyspace = "gokeyspace"
	cluster.Consistency = gocql.Quorum
	session, err := cluster.CreateSession()
	if err != nil {
		fmt.Println("Failed to connect")
	} else {
		fmt.Println("Connected successfully")
	}

	return app, session
}
