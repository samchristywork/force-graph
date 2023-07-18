package main

import (
	"fmt"
	"io/ioutil"
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
	nodes, edges := visitNode(path, root)

	f, err := os.Create("static/data.json")
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Fprintf(f, "{\n")
	fmt.Fprintf(f, "  \"bodies\": [\n")
	nodelen := len(nodes)
	counter := 0
	for _, node := range nodes {
		if counter == nodelen-1 {
			fmt.Fprintf(f, "    { \"label\": \"%s\", \"color\": \"%s\" }\n", node.name, node.color)
		} else {
			fmt.Fprintf(f, "    { \"label\": \"%s\", \"color\": \"%s\" },\n", node.name, node.color)
		}
		counter++
	}

	fmt.Fprintf(f, "  ],\n")
	fmt.Fprintf(f, "  \"springs\": [\n")
	edgelen := len(edges)
	counter = 0
	for _, edge := range edges {
		if counter == edgelen-1 {
			fmt.Fprintf(f, "    { \"body1\": \"%s\", \"body2\": \"%s\" }\n", edge.from, edge.to)
		} else {
			fmt.Fprintf(f, "    { \"body1\": \"%s\", \"body2\": \"%s\" },\n", edge.from, edge.to)
		}
		counter++
	}

	fmt.Fprintf(f, "  ]\n")
	fmt.Fprintf(f, "}\n")
}
