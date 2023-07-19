package main

import (
	"fmt"
	"net/http"
)

func dataHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	tag := query.Get("tag")

	if tag == "" {
		tag = "oxen"
		return
	}

	str := process_files("./testData", tag)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(str))
}

func serve() {
	dirname := "./static"
	fs := http.FileServer(http.Dir(dirname))

	http.Handle("/", fs)
	http.Handle("/data.json", http.HandlerFunc(dataHandler))

	fmt.Printf("Serving %s on HTTP port: 8080\n", dirname)
	http.ListenAndServe(":8080", nil)
}

func main() {
	serve()
}
