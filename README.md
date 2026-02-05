![Banner](https://s-christy.com/sbs/status-banner.svg?icon=editor/schema&hue=240&title=Force%20Graph&description=Interactive%20force-directed%20graph%20visualization)

## Overview

Force Graph is an interactive, browser-based tool for exploring interconnected
knowledge as a force-directed graph. A lightweight Go server reads `.dm` files
that describe nodes and their connections, then serves the graph as JSON to a
vanilla JavaScript frontend that lays it out using Verlet integration physics.

The physics simulation uses a Barnes-Hut quadtree to approximate long-range
repulsion forces in O(n log n) time, making it practical for graphs with
hundreds of nodes. The simulation terminates automatically once the graph
settles, detected by a kinetic-energy threshold rather than a fixed frame cap.

Nodes are colored by a `tags:` field in each `.dm` file, allowing related nodes
to be grouped visually. Color groups can be toggled on and off with the chip
controls that appear alongside the graph.

<p align="center">
  <img src="./assets/screenshot.png" />
</p>

## Features

## Usage

## Keyboard Shortcuts

## Data Format

## Dependencies

## License

This work is licensed under the GNU General Public License version 3 (GPLv3).

[<img src="https://s-christy.com/status-banner-service/GPLv3_Logo.svg" width="150" />](https://www.gnu.org/licenses/gpl-3.0.en.html)
