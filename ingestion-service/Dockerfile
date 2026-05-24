FROM golang:1.25.4

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN GOMAXPROCS=2 go build -p 2 -o siem-server ./cmd/server

EXPOSE 8080

CMD ["./siem-server"]