package core

import (
	"io"
	"log"
	"net/http"
	"os"
)



func UploadHandler(w http.ResponseWriter, r *http.Request) {
	f, err := os.Create("video.mp4")
	if err != nil {
		http.Error(w, "Could not create file", 500)
		return 
	}
	defer f.Close()

	_, err = io.Copy(f, r.Body)
	if err != nil {
		log.Println("Error copying Data: ", err)
		return 
	}
	log.Println("Finished receving stream.")

}


