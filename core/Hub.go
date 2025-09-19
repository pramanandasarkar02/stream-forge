package core

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)


type Peer struct {
	Name string
	Conn *websocket.Conn
	Send chan []byte
}


type Hub struct{
	peers map[*Peer]bool
	mu sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		peers: make(map[*Peer]bool),
	}
}

func (h *Hub) Add(p *Peer) {
	log.Println("Peer added with name: ", p.Name)
	h.mu.Lock()
	h.peers[p] = true
	h.mu.Unlock()
}

func (h *Hub) Remove(p *Peer) {
	log.Println("Peer Removed with name: ", p.Name)
	h.mu.Lock()
	delete(h.peers, p)
	h.mu.Unlock()
	p.Conn.Close()
}

func (h *Hub) Broadcast(frame []byte) {
	h.mu.Lock()
	for p := range h.peers {
		select {
		case p.Send <- frame:
		default:
		}
	}
	h.mu.Unlock()
}

