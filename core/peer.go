package core

import "github.com/gorilla/websocket"

type Peer struct {
	ID string
	Conn *websocket.Conn
	Send chan []byte
	IsHost bool 
}

