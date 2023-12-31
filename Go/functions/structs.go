package functions

import "time"

type userLogin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type serviceRequest struct {
	No          int64  `json:"no"`
	Description string `json:"description"`
	Type        string `json:"type"`
	Status      string `json:"status"`
	Assignee    string `json:"assignee"`
	Reporter    string `json:"reporter"`
	Priority    string `json:"priority"`
	Title       string `json:"title"`
	Project     string `json:"project_name"`
}

type retrieveSRData struct {
	No          int64     `json:"no"`
	Description []string  `json:"description"`
	Type        string    `json:"type"`
	Status      string    `json:"status"`
	Assignee    string    `json:"assignee"`
	Reporter    string    `json:"reporter"`
	Priority    string    `json:"priority"`
	Title       string    `json:"title"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type TableData struct {
	Name string `json:"name"`
	Age  string `json:"age"`
}

type SrFieldUpdate struct {
	Field string `json:"field"`
	Value string `json:"value"`
}

type Filters struct {
	Filter map[string][]string `json:"filter"`
}
