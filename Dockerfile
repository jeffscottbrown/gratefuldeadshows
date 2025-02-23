FROM golang:1.24-alpine AS appbuilder

WORKDIR /build

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o gdapp .

FROM gcr.io/distroless/static-debian12

ENV GIN_MODE=release

WORKDIR /app
COPY --from=appbuilder /build/gdapp .
COPY --from=appbuilder /build/server/assets ./server/assets/

CMD ["./gdapp"]
