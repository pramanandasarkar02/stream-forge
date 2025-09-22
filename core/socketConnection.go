package core

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r * http.Request) bool {
		return true
	},
}

func (hub *Hub)HandleVideoWebSocket(w http.ResponseWriter, r *http.Request){
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil{
		log.Printf("Websocket upgrade error: %v", err)
		return 
	}
	
	peerId := r.URL.Query().Get("clientId")
	if peerId == "" {
		peerId = generatePeerID()
	}

	isHost := r.URL.Query().Get("host") == "true"

	peer := &Peer{
		ID: peerId,
		Conn: conn,
		Send: make(chan []byte),
		IsHost: isHost,
	}

	hub.Register <- peer

	go hub.WritePump(peer)
	go hub.readPump(peer)

}



func (hub *Hub) readPump(peer *Peer) {
	defer func(){
		hub.Unregister <- peer
		peer.Conn.Close()
	}()

	for {
		_, messageData, err := peer.Conn.ReadMessage()
		if err != nil{
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure){
				log.Printf("Websocket err: %v", err)
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(messageData, &msg); err != nil{
			log.Printf("JSON unmarshal err: %v", err)
			continue
		}

		msg.From = peer.ID

		switch msg.Type {
		case "video-data":
			data, _ := json.Marshal(msg)
			hub.Mutex.RLock()
			for p := range hub.Peers {
				if p != peer {
					select{
					case p.Send <- data:
					default:
						close(p.Send)
						delete(hub.Peers, p)
					}
				}
			}
			hub.Mutex.RUnlock()
		case "offer", "answer", "ice-candidate":
			data, _ := json.Marshal(msg)
			hub.BroadcastChan <- data
		default:
			data, _ := json.Marshal(msg)
			hub.BroadcastChan <- data
			
		}
	}


}

func (hub *Hub)WritePump(peer *Peer) {
	defer peer.Conn.Close()

	for {
		select{
		case message, ok := <- peer.Send:
			if !ok {
				peer.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return 
			}

			if err := peer.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("Websocket write err: %v", err)
				return 
			}
		}
	}
}


func generatePeerID() string{
	return fmt.Sprintf("client_%d", time.Now().UnixNano())
}



// func HubChatHandler(hub *Hub) http.HandlerFunc {
// 	return func (w http.ResponseWriter, r *http.Request)  {
// 		conn, err := upgrader.Upgrade(w,r, nil) 
// 		if err != nil {
// 			log.Println("upgrade: ", err)
// 			return 
// 		}

// 		peer := &Peer{
// 			Name: uuid.NewString(),
// 			Conn: conn,
// 			Send: make(chan []byte, 5),
// 		}

// 		hub.Add(peer)

// 		go func() {
// 			defer func(){
// 				hub.Remove(peer)	
// 			}()

// 			for {
// 				_, message, err := conn.ReadMessage()
// 				if err != nil {
// 					log.Println("Error reading message: ", err)
// 					break
// 				}

// 				log.Printf("Received message: %s\n", message)
// 				// broadcast message

// 				for p := range hub.peers {
// 					if err := p.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
// 						fmt.Printf("Error in writting message: %s to %s", message, p.Name)
// 					}
// 				}
// 			}
// 		}()

	

// 	}
// }

