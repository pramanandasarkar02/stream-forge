package core

type Message struct {
	Type string 		`json:"type"`
	Data interface{} 	`json:"data"`
	From string 		`json:"from"`
}


