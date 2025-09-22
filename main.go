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

	// chatHub := core.NewHub()
	// videoHub := core.NewHub() 

	// http.HandleFunc("/ws/chat", core.HubChatHandler(chatHub))
	// http.HandleFunc("/ws/video", core.HubStreamHandler(videoHub))


	hub := core.NewHub()
	go hub.Run()

	http.HandleFunc("/ws", hub.HandleVideoWebSocket)


	log.Println("server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}