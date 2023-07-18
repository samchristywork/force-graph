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

func visitNode(path, root string) ([]Node, []Edge) {
	if _, ok := visited[root]; ok {
		return nil, nil
	}

	visited[root] = true

	contents, err := ioutil.ReadFile(path + "/" + root + ".dm")
	if err != nil {
		nodes := make([]Node, 0)
		edges := make([]Edge, 0)

		nodes = append(nodes, Node{name: root, color: "blue"})

		return nodes, edges
	}

	tagMap := make(map[string]bool)

	for i := 0; i < len(contents); i++ {
		if contents[i] == '[' {
			for j := i; j < len(contents); j++ {
				if contents[j] == '\n' {
					break
				}
				if contents[j] == ']' {
					tagname := string(contents[i+1 : j])

					if _, ok := tagMap[tagname]; !ok {
						tagMap[tagname] = true
					}

					break
				}
			}
		}
	}

	nodes := make([]Node, 0)
	edges := make([]Edge, 0)

	nodes = append(nodes, Node{name: root, color: "red"})

	for tagname := range tagMap {
		new_nodes, new_edges := visitNode(path, tagname)
		nodes = append(nodes, new_nodes...)
		edges = append(edges, new_edges...)

		edges = append(edges, Edge{from: root, to: tagname})
	}

	return nodes, edges
}

func process_files(path string, root string) {
}
