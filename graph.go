package main

import (
	"fmt"
	"io/ioutil"
	"os"
)

type Edge struct {
	from string
	to   string
}

type Node struct {
	name  string
	color string
}

var visited = make(map[string]bool)

func process_files(path string, root string) {
}
