package main;

import (
  "net/http"
)

func serve() {
    dirname := "./static"
    fs := http.FileServer(http.Dir(dirname))
    http.Handle("/", fs)

    fmt.Printf("Serving %s on HTTP port: 8080\n", dirname)
    http.ListenAndServe(":8080", nil)
}

func main() {
  serve()
}
