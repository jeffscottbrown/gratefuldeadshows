FROM golang:1.24.1-alpine AS appbuilder

RUN apk update && apk add --no-cache build-base go
WORKDIR /build

COPY go.mod go.sum ./

RUN go mod download

COPY . .

ENV CGO_ENABLED=1

RUN go build -o gratefuldeadshows .

FROM alpine:latest

ENV GIN_MODE=release

WORKDIR /app

COPY --from=appbuilder /build/gratefuldeadshows ./
COPY --from=appbuilder /build/server/assets ./server/assets/
COPY --from=appbuilder /build/server/html ./server/html/
COPY --from=appbuilder /build/db/gratefuldata.db ./db/

CMD ["./gratefuldeadshows"]
