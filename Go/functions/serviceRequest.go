package functions

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gocql/gocql"
	"github.com/gofiber/fiber/v2"
)

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
		"INSERT INTO serviceRequest (no,assignee,description,reporter,status,type,priority,title,createdAt,updatedAt) VALUES (?, ?, ?, ?, ?, ?,?,?,toTimestamp(now()),toTimestamp(now()))",
		srNo+1,
		p.Assignee,
		p.Description,
		p.Reporter,
		p.Status,
		p.Type,
		p.Priority,
		p.Title,
	)
	if err := query.Exec(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"Err": "Could not create SR"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Message": "SR Successfully created"})

}

func UpdateSrStatus(c *fiber.Ctx, session *gocql.Session) error {
	no, err := strconv.ParseInt(c.Params("no"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Err": "Invalid SR number"})
	}
	status := c.Params("status")
	query := session.Query("Update servicerequest set status = ?,updatedAt = toTimestamp(now())  where no = ?", status, no)
	if err := query.Exec(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"Err": "Could not update SR"})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Message": "SR Successfully Updated"})
}

func UpdateSr(c *fiber.Ctx, session *gocql.Session) error {
	no, err := strconv.ParseInt(c.Params("no"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Err": "Invalid SR number"})
	}
	p := new(SrFieldUpdate)
	if err = c.BodyParser(p); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Error": "Details are missing"})
	}
	field := p.Field;
	value := p.Value;
	query := session.Query("Update servicerequest set " + field + " = ?  where no = ?", value, no);
	if field == "comments"{
		query = session.Query("Update servicerequest set " + field + " = " + field + " + "+ " [ " + "'" +value+"'"+ " ] " + " where no = ?",no);
	}
	if err := query.Exec(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"Err": "Could not update SR"})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Message": "SR Successfully Updated"})
}

func GetSrDataForStatus(c *fiber.Ctx, session *gocql.Session) error {
	status := c.Params("status")
	query := session.Query("Select no,description,Type,status,assignee,title,priority,createdAt,updatedAt from serviceRequest where status = ? ALLOW FILTERING", status)
	var data []retrieveSRData
	scanner := query.Iter().Scanner()
	for scanner.Next() {
		var no int64
		var description string
		var Type string
		var status string
		var assignee string
		var priority string
		var title string
		var createdAt time.Time
		var updatedAt time.Time
		err := scanner.Scan(&no, &description, &Type, &status, &assignee, &title, &priority, &createdAt,&updatedAt)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}
		data1 := retrieveSRData{No: no, Description: strings.Split(description, " "), Type: Type, Status: status, Assignee: assignee, Priority: priority, Title: title, CreatedAt: createdAt,UpdatedAt: updatedAt}
		data = append(data, data1)
	}
	sort.Slice(data, func(i, j int) bool {
		return data[j].UpdatedAt.Before(data[i].UpdatedAt)
	})
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"data": data})
}

func GetSrDataForId(c *fiber.Ctx, session *gocql.Session) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Error": "Invalid Id"})
	}
	query := session.Query("Select no,description,title,Type,status,reporter,assignee,priority,createdAt,updatedAt,comments from serviceRequest where no = ? ALLOW FILTERING", id)
	var no int64
	var description string
	var title string
	var Type string
	var status string
	var assignee string
	var reporter string
	var priority string
	var createdAt time.Time
	var updatedAt time.Time
	var comments []string
	err = query.Scan(&no, &description, &title, &Type, &status, &reporter, &assignee, &priority, &createdAt, &updatedAt,&comments)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"Error": "No such card exists"})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"no":          no,
		"description": description,
		"title":       title,
		"type":        Type,
		"status":      status,
		"assignee":    assignee,
		"reporter":    reporter,
		"priority":    priority,
		"createdAt":   getNumberOfDays(createdAt),
		"updatedAt":   getNumberOfDays(updatedAt),
		"comments" : reverseArray(comments),
	})

}

//Function for filtering data when filters are added in the front end

func FilteredData(c *fiber.Ctx,session *gocql.Session) error{
	filter := new(Filters);
	err := c.BodyParser(filter);
	if err != nil{
		fmt.Println(err);
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"Message":"Invalid body"})
	}
    assigneeFilterValues := filter.Filter["assignee"];
	reporterFilterValues := filter.Filter["reporter"];
	priorityFilterValues := filter.Filter["priority"];
	statusFilterValues := filter.Filter["status"];
	typeFilterValues := filter.Filter["type"];
	queryString :="Select no,description,title,Type,status,reporter,assignee,priority,createdAt,updatedAt from serviceRequest  ";
	queryString += " ";
	filterString := "";
	if(len(assigneeFilterValues) != 0){
       filterString += " Where assignee in ("
	   for index,value := range assigneeFilterValues{
		 filterString += "'"+value + "'";
		 if index != len(assigneeFilterValues)-1{
			filterString += ","
		 }
	   }
	   filterString += ")"
	}
	if(len(reporterFilterValues) != 0){
		if len(filterString) == 0{
			filterString += " Where reporter in ("
		 } else{
             filterString += " And reporter in ("
		 }
       
	   for index,value := range reporterFilterValues{
		 filterString += "'"+value + "'";
		 if index != len(reporterFilterValues)-1{
			filterString += ","
		 }
	   }
	   filterString += ")"
	}
	if(len(priorityFilterValues) != 0){
		if len(filterString) == 0{
			filterString += " Where priority in ("
		 } else{
             filterString += " And priority in ("
		 }
       
	   for index,value := range priorityFilterValues{
		 filterString += "'"+value + "'";
		 if index != len(priorityFilterValues)-1{
			filterString += ","
		 }
	   }
	   filterString += ")"
	}
    if(len(statusFilterValues) != 0){
		if len(filterString) == 0{
			filterString += " Where status in ("
		 } else{
             filterString += " And status in ("
		 }
       
	   for index,value := range statusFilterValues{
		 filterString += "'"+value + "'";
		 if index != len(statusFilterValues)-1{
			filterString += ","
		 }
	   }
	   filterString += ")"
	}
	if(len(typeFilterValues) != 0){
		if len(filterString) == 0{
			filterString += " Where type in ("
		 } else{
             filterString += " And type in ("
		 }
       
	   for index,value := range typeFilterValues{
		 filterString += "'"+value + "'";
		 if index != len(typeFilterValues)-1{
			filterString += ","
		 }
	   }
	   filterString += ")"
	}

	if len(filterString) != 0{
		queryString += filterString
	}
   	queryString += " Allow filtering";
	query := session.Query(queryString);
	var ToDodata []retrieveSRData;
	var InProgress []retrieveSRData;
	var Done []retrieveSRData;
	var Rejected []retrieveSRData;
	var Accepted []retrieveSRData;
	scanner := query.Iter().Scanner()
	for scanner.Next() {
		var no int64 ;var description string; var Type string; var status string ;var reporter string
	    var assignee string ;var priority string ;var title string ;var createdAt time.Time; var updatedAt time.Time
		err := scanner.Scan(&no, &description, &title, &Type, &status, &reporter, &assignee,&priority,&createdAt,&updatedAt)
		if err != nil {
			fmt.Println(err);
			return c.SendStatus(fiber.StatusInternalServerError)
		}
		data := retrieveSRData{No: no, Description: strings.Split(description, " "), Type: Type,Reporter: reporter, Status: status, Assignee: assignee, Priority: priority, Title: title, CreatedAt: createdAt,UpdatedAt: updatedAt}
		if status == "ToDo"{
            ToDodata = append(ToDodata, data);
		} else if status == "InProgress"{
			InProgress = append(InProgress, data);
		} else if status == "Done"{
			Done = append(Done, data)
		} else if status == "Accpeted"{
			Accepted = append(Accepted, data)
		} else{
			Rejected = append(Rejected, data);
		}
		
		
	}
	sort.Slice(ToDodata, func(i, j int) bool {
		return ToDodata[j].UpdatedAt.Before(ToDodata[i].UpdatedAt)
	})
	sort.Slice(InProgress, func(i, j int) bool {
		return InProgress[j].UpdatedAt.Before(InProgress[i].UpdatedAt)
	})
	sort.Slice(Done, func(i, j int) bool {
		return Done[j].UpdatedAt.Before(Done[i].UpdatedAt)
	})
   sort.Slice(Accepted, func(i, j int) bool {
		return Accepted[j].UpdatedAt.Before(Accepted[i].UpdatedAt)
	})
	sort.Slice(Rejected, func(i, j int) bool {
		return Rejected[j].UpdatedAt.Before(Rejected[i].UpdatedAt)
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"ToDo":ToDodata,"InProgress":InProgress,"Done":Done,"Rejected":Rejected,"Accepted":Accepted})

}

func CreateWorkSpace(c *fiber.Ctx,session *gocql.Session) error{
	projectName := c.Params("name");

	query := session.Query(
		"INSERT INTO project (project_name,project_id) VALUES (?,uuid())",projectName,
	)
	if err := query.Exec(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"Err": "Could not Project"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Message": "Project Successfully created"})
}

func GetAllWorkSpaces(c *fiber.Ctx,session *gocql.Session) error{
	query := session.Query("Select project_name from project");
	var workspaces []string;
	scanner := query.Iter().Scanner();
	for scanner.Next(){
      var workspace string;
      err := scanner.Scan(&workspace);
	  if err != nil{
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"Err": "Something went wrong"})
	  }
	  workspaces = append(workspaces, workspace)
	}
    
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Data":workspaces})
    


}


