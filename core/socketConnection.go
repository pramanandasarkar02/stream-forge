package core

import (
	"fmt"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r * http.Request) bool {
		return true
	},
}




func HubHandler(hub *Hub) http.HandlerFunc {
	return func (w http.ResponseWriter, r *http.Request)  {
		conn, err := upgrader.Upgrade(w,r, nil) 
		if err != nil {
			log.Println("upgrade: ", err)
			return 
		}

		peer := &Peer{
			Name: uuid.NewString(),
			Conn: conn,
			Send: make(chan []byte, 5),
		}

		hub.Add(peer)

		go func() {
			defer func(){
				hub.Remove(peer)	
			}()

			for {
				_, message, err := conn.ReadMessage()
				if err != nil {
					log.Println("Error reading message: ", err)
					break
				}

				log.Printf("Received message: %s\n", message)
				// broadcast message

				for p := range hub.peers {
					if err := p.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
						fmt.Printf("Error in writting message: %s to %s", message, p.Name)
					}
				}
			}
		}()

	

	}
}