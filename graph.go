package main

import (
	"fmt"
	"io/ioutil"
	"math"
	"strings"
)

type Edge struct {
	from string
	to   string
}

type Node struct {
	name     string
	color    string
	depth    float64
	arcBegin float64
	arcEnd   float64
}

var visited = make(map[string]bool)

func visitNode(path, root string, depth float64, arcBegin float64, arcEnd float64) ([]Node, []Edge) {
	if _, ok := visited[root]; ok {
		return nil, nil
	}

	visited[root] = true

	contents, err := ioutil.ReadFile(path + "/" + root + ".dm")
	if err != nil {
		nodes := make([]Node, 0)
		edges := make([]Edge, 0)

		nodes = append(nodes, Node{name: root, color: "red", depth: depth, arcBegin: arcBegin, arcEnd: arcEnd})

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

	nodes = append(nodes, Node{name: root, color: "blue", depth: depth, arcBegin: arcBegin, arcEnd: arcEnd})

	keys := make([]string, 0, len(tagMap))
	for k := range tagMap {
		keys = append(keys, k)
	}

	allowedSpace := arcEnd - arcBegin
	for counter, tagname := range keys {
		section := float64(counter) / float64(len(tagMap))
		arcBegin := arcBegin + (allowedSpace * section)
		arcEnd := arcBegin + (allowedSpace / float64(len(tagMap)))

		new_nodes, new_edges := visitNode(path, tagname, depth+1, arcBegin, arcEnd)

		nodes = append(nodes, new_nodes...)
		edges = append(edges, new_edges...)

		edges = append(edges, Edge{from: root, to: tagname})
	}

	return nodes, edges
}

func process_files(path string, root string) string {
	visited = make(map[string]bool)

	nodes, edges := visitNode(path, root, 0, 0.0, 1.0)

	str := ""

	str += "{\n"
	str += "  \"bodies\": [\n"
	nodelen := len(nodes)
	counter := 0
	for _, node := range nodes {
		x := 250.0 + 50.0*node.depth*math.Cos(node.arcBegin*math.Pi*2.0)
		y := 250.0 + 50.0*node.depth*math.Sin(node.arcBegin*math.Pi*2.0)

		if counter == nodelen-1 {
			str += fmt.Sprintf("    { \"label\": \"%s\", \"color\": \"%s\", \"x\": %f, \"y\": %f }\n", node.name, node.color, x, y)
		} else {
			str += fmt.Sprintf("    { \"label\": \"%s\", \"color\": \"%s\", \"x\": %f, \"y\": %f },\n", node.name, node.color, x, y)
		}
		counter++
	}

	str += "  ],\n"
	str += "  \"springs\": [\n"
	edgelen := len(edges)
	counter = 0
	for _, edge := range edges {
		if counter == edgelen-1 {
			str += fmt.Sprintf("    { \"body1\": \"%s\", \"body2\": \"%s\" }\n", edge.from, edge.to)
		} else {
			str += fmt.Sprintf("    { \"body1\": \"%s\", \"body2\": \"%s\" },\n", edge.from, edge.to)
		}
		counter++
	}

	str += "  ]\n"
	str += "}\n"

	return str
}
