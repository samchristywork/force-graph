package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
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

func tagsHandler(w http.ResponseWriter, r *http.Request) {
	entries, err := os.ReadDir("./testData")
	if err != nil {
		http.Error(w, `{"error":"could not read tags"}`, http.StatusInternalServerError)
		return
	}
	tags := make([]string, 0, len(entries))
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".dm") {
			tags = append(tags, strings.TrimSuffix(e.Name(), ".dm"))
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}

func serve() {
	dirname := "./static"
	fs := http.FileServer(http.Dir(dirname))

	http.Handle("/", fs)
	http.Handle("/data.json", http.HandlerFunc(dataHandler))
	http.Handle("/tags", http.HandlerFunc(tagsHandler))

	fmt.Printf("Serving %s on HTTP port: 8080\n", dirname)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func main() {
	if err := loadColorDefinitions("./colors.json"); err != nil && !os.IsNotExist(err) {
		log.Printf("warning: could not load colors.json: %v", err)
	}
	serve()
}
