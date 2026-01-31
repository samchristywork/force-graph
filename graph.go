package main

import (
	"encoding/json"
	"math"
	"os"
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

var colorDefinitions = map[string]string{}

func loadColorDefinitions(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &colorDefinitions)
}

func hashToColor(tag string) string {
	if tag == "" {
		return "blue"
	}

	if color, ok := colorDefinitions[tag]; ok {
		return color
	}

	hash := 0
	for i := 0; i < len(tag); i++ {
		hash += int(tag[i])
	}

	hash = hash % 12

	switch hash {
	case 0:
		return "red"
	case 1:
		return "green"
	case 2:
		return "blue"
	case 3:
		return "yellow"
	case 4:
		return "orange"
	case 5:
		return "purple"
	case 6:
		return "cyan"
	case 7:
		return "magenta"
	case 8:
		return "lime"
	case 9:
		return "pink"
	case 10:
		return "teal"
	case 11:
		return "lavender"
	}

	return "blue"
}

func extractTag(contents []byte) string {
	lines := strings.Split(string(contents), "\n")

	if len(lines) < 3 {
		return ""
	}

	thirdLine := strings.Split(lines[2], " ")

	if len(thirdLine) < 2 {
		return ""
	}

	if thirdLine[0] != "tags:" {
		return ""
	}

	tag := thirdLine[1]

	return tag
}

func visitNode(path, root string, depth float64, arcBegin float64, arcEnd float64, visited map[string]bool) ([]Node, []Edge) {
	if _, ok := visited[root]; ok {
		return nil, nil
	}

	visited[root] = true

	contents, err := os.ReadFile(path + "/" + root + ".dm")
	if err != nil {
		nodes := make([]Node, 0)
		edges := make([]Edge, 0)

		nodes = append(nodes, Node{name: root, color: "red", depth: depth, arcBegin: arcBegin, arcEnd: arcEnd})

		return nodes, edges
	}

	tagMap := make(map[string]bool)

	mytag := extractTag(contents)

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

	color := hashToColor(mytag)
	if override, ok := colorDefinitions[root]; ok {
		color = override
	}

	nodes = append(nodes, Node{name: root, color: color, depth: depth, arcBegin: arcBegin, arcEnd: arcEnd})

	keys := make([]string, 0, len(tagMap))
	for k := range tagMap {
		keys = append(keys, k)
	}

	allowedSpace := arcEnd - arcBegin
	for counter, tagname := range keys {
		section := float64(counter) / float64(len(tagMap))
		arcBegin := arcBegin + (allowedSpace * section)
		arcEnd := arcBegin + (allowedSpace / float64(len(tagMap)))

		new_nodes, new_edges := visitNode(path, tagname, depth+1, arcBegin, arcEnd, visited)

		nodes = append(nodes, new_nodes...)
		edges = append(edges, new_edges...)

		edges = append(edges, Edge{from: root, to: tagname})
	}

	return nodes, edges
}

type bodyJSON struct {
	Label string  `json:"label"`
	Color string  `json:"color"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
}

type springJSON struct {
	Body1 string `json:"body1"`
	Body2 string `json:"body2"`
}

type graphJSON struct {
	Bodies  []bodyJSON   `json:"bodies"`
	Springs []springJSON `json:"springs"`
}

func process_files(path string, root string) (string, error) {
	visited := make(map[string]bool)

	nodes, edges := visitNode(path, root, 0, 0.0, 1.0, visited)

	g := graphJSON{
		Bodies:  make([]bodyJSON, 0, len(nodes)),
		Springs: make([]springJSON, 0, len(edges)),
	}

	for _, node := range nodes {
		x := 250.0 + 50.0*node.depth*math.Cos(node.arcBegin*math.Pi*2.0)
		y := 250.0 + 50.0*node.depth*math.Sin(node.arcBegin*math.Pi*2.0)
		g.Bodies = append(g.Bodies, bodyJSON{Label: node.name, Color: node.color, X: x, Y: y})
	}

	for _, edge := range edges {
		g.Springs = append(g.Springs, springJSON{Body1: edge.from, Body2: edge.to})
	}

	b, err := json.Marshal(g)
	if err != nil {
		return "", err
	}
	return string(b), nil
}
