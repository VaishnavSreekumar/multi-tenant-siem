package websocket

import (
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients map[*websocket.Conn]bool
	mutex   sync.Mutex
}

var WS = NewHub()

func NewHub() *Hub {

	return &Hub{
		clients: make(map[*websocket.Conn]bool),
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *Hub) HandleConnections(
	w http.ResponseWriter,
	r *http.Request,
) {

	conn, err := upgrader.Upgrade(
		w,
		r,
		nil,
	)

	if err != nil {
		return
	}

	h.mutex.Lock()
	h.clients[conn] = true
	h.mutex.Unlock()

	for {

		_, _, err := conn.ReadMessage()

		if err != nil {

			h.mutex.Lock()
			delete(h.clients, conn)
			h.mutex.Unlock()

			conn.Close()

			break
		}
	}
}

func (h *Hub) Broadcast(data interface{}) {

	h.mutex.Lock()
	defer h.mutex.Unlock()

	for client := range h.clients {

		err := client.WriteJSON(data)

		if err != nil {

			client.Close()
			delete(h.clients, client)
		}
	}
}
