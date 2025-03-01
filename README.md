# Grateful Web

Grateful Web is a simple web application for browsing information about
the concert history of The Grateful Dead.

The data provided in the application was sourced from 
[github.com/jefmsmit/gdshowsdb](https://github.com/jefmsmit/gdshowsdb).

## Running The Application

If you have [Go installed](https://golang.org/) (1.24 or later), you can run the application with the following command:

```bash
go run .
```

The applications listens for browser requests at
[http://localhost:8080](http://localhost:8080).

If you anticipate experimenting with the source code you may want to launch 
using the [Air live reload tool](https://github.com/cosmtrek/air).  With live
reloading enabled source code changes will be automatically reloading in 
the application without requiring the application to be explicitly restarted.
Saving changes to the filesystem will trigger a reload of the system.

```bash
go tool air
```

The project provides a [Dockerfile](https://www.docker.com/) for containerizing the application. 

Images are published to dockerhub:

```bash
docker run -p 8080:8080 docker.io/jeffscottbrown/gratefulweb:latest
```

## The Technology

The project is built with the following technologies:

- [Golang](https://golang.org/)
- [SQLite](https://www.sqlite.org/)
- [Bootstrap](https://getbootstrap.com/)
- [HTMX](https://htmx.org/)
- [Gin](https://gin-gonic.com/)

The Golang source code is in server/*.go and db/*.go.

The UI code is in server/html/*.html and server/assets/main.css.
