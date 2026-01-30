package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func dataHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	tag := query.Get("tag")

	if tag == "" {
		tag = "oxen"
	}

	if _, err := os.Stat("./testData/" + tag + ".dm"); os.IsNotExist(err) {
		http.Error(w, `{"error":"tag not found"}`, http.StatusNotFound)
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
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func main() {
	if err := loadColorDefinitions("./colors.json"); err != nil && !os.IsNotExist(err) {
		log.Printf("warning: could not load colors.json: %v", err)
	}
	serve()
}
