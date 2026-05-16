package websocket

import (
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"siem/internal/metrics"
)

type Hub struct {
	clients map[*websocket.Conn]bool
	mutex   sync.Mutex

	batchMutex sync.Mutex
	batch      []interface{}
}

var WS = NewHub()

func NewHub() *Hub {
	h := &Hub{
		clients: make(map[*websocket.Conn]bool),
		batch:   make([]interface{}, 0),
	}
	go h.batchSender()
	return h
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *Hub) batchSender() {
	ticker := time.NewTicker(1 * time.Second)
	for range ticker.C {
		h.flushBatch()
	}
}

func (h *Hub) flushBatch() {
	h.batchMutex.Lock()
	if len(h.batch) == 0 {
		h.batchMutex.Unlock()
		return
	}
	batchToSend := h.batch
	h.batch = make([]interface{}, 0)
	h.batchMutex.Unlock()

	h.mutex.Lock()
	defer h.mutex.Unlock()

	for client := range h.clients {
		err := client.WriteJSON(batchToSend)
		if err != nil {
			client.Close()
			delete(h.clients, client)
		}
	}
	metrics.WebsocketBatchesSent.Inc()
}

func (h *Hub) HandleConnections(
	w http.ResponseWriter,
	r *http.Request,
) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	h.mutex.Lock()
	h.clients[conn] = true
	h.mutex.Unlock()
	metrics.WebsocketConnectionsActive.Inc()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			h.mutex.Lock()
			delete(h.clients, conn)
			h.mutex.Unlock()
			metrics.WebsocketConnectionsActive.Dec()
			conn.Close()
			break
		}
	}
}

func (h *Hub) Broadcast(data interface{}) {
	h.batchMutex.Lock()
	h.batch = append(h.batch, data)
	h.batchMutex.Unlock()
}
