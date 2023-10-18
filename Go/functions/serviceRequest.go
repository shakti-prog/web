package functions

import (
	"strconv"
	"strings"

	"github.com/gocql/gocql"
	"github.com/gofiber/fiber/v2"
)


func GetSrData(c *fiber.Ctx, session *gocql.Session) error {
	query := "Select no,description,Type,status,reporter,assignee from serviceRequest"
	var toDoData []retrieveSRData
	var inProgressData []retrieveSRData
	var doneData []retrieveSRData
	var rejecedData []retrieveSRData
	var acceptedData []retrieveSRData
	scanner := session.Query(query).Iter().Scanner()
	for scanner.Next() {
		var no int64
		var description string
		var Type string
		var status string
		var reporter string
		var assignee string
		err := scanner.Scan(&no, &description, &Type, &status, &reporter, &assignee)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}
		data1 := retrieveSRData{No: no, Description: strings.Split(description," "), Type: Type, Status: status, Reporter: reporter, Assignee: assignee}
		if data1.Status == "ToDo" {
			toDoData = append(toDoData, data1)
		} else if data1.Status == "InProgress" {
			inProgressData = append(inProgressData, data1)
		} else if data1.Status == "Done" {
			doneData = append(doneData, data1)
		} else if data1.Status == "Accepted" {
			acceptedData = append(acceptedData, data1)
		} else {
			rejecedData = append(rejecedData, data1)
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"toDo":       toDoData,
		"inProgress": inProgressData,
		"done":       doneData,
		"rejected":   rejecedData,
		"accepted":   acceptedData,
	})
}

func CreateNewSr(c *fiber.Ctx, session *gocql.Session) error {

	p := new(serviceRequest)
	if err := c.BodyParser(p); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Error": "Details are missing"})
	}

	var srNo int
	if err := session.Query("SELECT MAX(no) FROM servicerequest").Scan(&srNo); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Error": "Something went wrong"})
	}

	query := session.Query(
		"INSERT INTO serviceRequest (no,assignee,description,reporter,status,type) VALUES (?, ?, ?, ?, ?, ?)",
		srNo+1,
		p.Assignee,
		p.Description,
		p.Reporter,
		p.Status,
		p.Type,
	)
	if err := query.Exec(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"Err": "Could not create SR"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Message": "SR Successfully created"})

}

func UpdateSr(c *fiber.Ctx, session *gocql.Session) error {
	no, err := strconv.ParseInt(c.Params("no"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Err": "Invalid SR number"})
	}
	status := c.Params("status")
	query := session.Query("Update servicerequest set status = ? where no = ?", status, no)
	if err := query.Exec(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"Err": "Could not update SR"})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Message": "SR Successfully Updated"})
}
