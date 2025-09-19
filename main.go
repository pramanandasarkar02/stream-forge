package main

import (
	"log"
	"net/http"
	"streamForge/core"
)

func main(){
	
	log.Println("Stream Service Started ...")

	// static file service 
	http.Handle("/", http.FileServer(http.Dir("./static")))
	// functionality service
	http.HandleFunc("/upload", core.UploadHandler)

	hub := core.NewHub() 

	http.HandleFunc("/ws", core.HubHandler(hub))


	log.Println("server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}