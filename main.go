package main

import (
	"fmt"
	"log"
	"net/http"
	"streamForge/core"
)

func main(){
	fmt.Print("Server Started")

	http.HandleFunc("/upload", core.UploadHandler)
	log.Println("server started at 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}