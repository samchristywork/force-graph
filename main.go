package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
)

var validTag = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)

func dataHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	tag := query.Get("tag")

	if tag == "" {
		tag = "literature"
	}

	if !validTag.MatchString(tag) {
		http.Error(w, `{"error":"invalid tag"}`, http.StatusBadRequest)
		return
	}

	if _, err := os.Stat("./testData/" + tag + ".dm"); os.IsNotExist(err) {
		http.Error(w, `{"error":"tag not found"}`, http.StatusNotFound)
		return
	}

	str, err := process_files("./testData", tag)
	if err != nil {
		log.Printf("error building graph for tag %q: %v", tag, err)
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}
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
