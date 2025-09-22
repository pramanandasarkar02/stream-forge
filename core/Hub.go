package core

import (
	"encoding/json"
	"log"
	"sync"
)



type Hub struct{
	Peers map[*Peer]bool
	BroadcastChan chan []byte
	Register chan *Peer
	Unregister chan *Peer
	Mutex  sync.RWMutex
}


func NewHub() *Hub {
	return &Hub{
		Peers: make(map[*Peer]bool),
		BroadcastChan: make(chan []byte),
		Register: make(chan *Peer),
		Unregister: make(chan *Peer),
	}
}


func (hub* Hub) Run() {
	for {
		select{
		case peer := <-hub.Register:
			hub.Mutex.Lock()
			hub.Peers[peer] = true
			hub.Mutex.Unlock()

			log.Printf("peer %s connected. Total peers: %d", peer.ID, len(hub.Peers))

			welcomeMsg := Message{
				Type: "connected",
				Data: map[string]interface{}{
					"peerId": peer.ID,
					"isHost": peer.IsHost,
				},
			}
			data, _ := json.Marshal(welcomeMsg)
			select{
			case peer.Send <- data:
			default:
				close(peer.Send)
				delete(hub.Peers, peer)
			}
		case peer := <-hub.Unregister:
			hub.Mutex.Lock()
			if _, ok := hub.Peers[peer]; ok {
				delete(hub.Peers, peer)
				close(peer.Send)
				log.Printf("Peer %s disconnected. Total Peers: %d", peer.ID, len(hub.Peers))
			}
			hub.Mutex.Unlock()

		case message := <- hub.BroadcastChan:
			hub.Mutex.RLock()
			for peer := range hub.Peers {
				select {
				case peer.Send <- message:
				default:
					close(peer.Send)
					delete(hub.Peers, peer)
				}
			}
			hub.Mutex.RUnlock()

		}
	}
}




