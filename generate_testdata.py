#!/usr/bin/env python3

import os

OUTPUT_DIR = "testData"

GRAPH = {
    "literature": ["ancient", "medieval", "renaissance", "romantic", "realist", "modernist"],

    # Periods
    "ancient":     ["homer", "sophocles", "virgil"],
    "medieval":    ["dante", "chaucer"],
    "renaissance": ["shakespeare", "cervantes", "montaigne"],
    "romantic":    ["austen", "goethe", "keats", "byron"],
    "realist":     ["dickens", "tolstoy", "dostoevsky", "flaubert", "chekhov"],
    "modernist":   ["kafka", "woolf", "joyce", "eliot"],

    # Authors -> works and themes
    "homer":        ["iliad", "odyssey", "epic"],
    "sophocles":    ["oedipus", "antigone", "tragedy"],
    "virgil":       ["aeneid", "epic"],
    "dante":        ["divine_comedy", "allegory"],
    "chaucer":      ["canterbury_tales", "satire"],
    "shakespeare":  ["hamlet", "macbeth", "midsummer", "tragedy", "comedy"],
    "cervantes":    ["don_quixote", "satire", "comedy"],
    "montaigne":    ["essays", "humanism"],
    "austen":       ["pride_and_prejudice", "emma", "romance", "irony"],
    "goethe":       ["faust", "tragedy"],
    "keats":        ["odes", "romance", "mortality"],
    "byron":        ["don_juan", "romance", "satire"],
    "dickens":      ["great_expectations", "bleak_house", "social_critique"],
    "tolstoy":      ["war_and_peace", "anna_karenina", "epic", "moral_philosophy"],
    "dostoevsky":   ["crime_and_punishment", "the_brothers_karamazov", "existentialism", "tragedy"],
    "flaubert":     ["madame_bovary", "irony", "social_critique"],
    "chekhov":      ["the_cherry_orchard", "the_seagull", "comedy", "tragedy"],
    "kafka":        ["the_trial", "the_metamorphosis", "existentialism", "alienation"],
    "woolf":        ["mrs_dalloway", "to_the_lighthouse", "stream_of_consciousness"],
    "joyce":        ["ulysses", "dubliners", "stream_of_consciousness", "homer"],
    "eliot":        ["the_waste_land", "alienation", "myth"],

    # Works -> themes
    "iliad":                    ["epic", "war", "heroism", "tragedy"],
    "odyssey":                  ["epic", "heroism", "homecoming"],
    "oedipus":                  ["tragedy", "fate"],
    "antigone":                 ["tragedy", "duty"],
    "aeneid":                   ["epic", "duty", "homecoming"],
    "divine_comedy":            ["allegory", "afterlife", "epic"],
    "canterbury_tales":         ["satire", "comedy", "pilgrimage"],
    "hamlet":                   ["tragedy", "revenge", "mortality"],
    "macbeth":                  ["tragedy", "ambition", "guilt"],
    "midsummer":                ["comedy", "romance", "magic"],
    "don_quixote":              ["satire", "comedy", "idealism"],
    "essays":                   ["humanism", "self_knowledge"],
    "pride_and_prejudice":      ["romance", "irony", "social_critique"],
    "emma":                     ["romance", "irony", "comedy"],
    "faust":                    ["tragedy", "ambition", "allegory"],
    "odes":                     ["romance", "mortality", "beauty"],
    "don_juan":                 ["satire", "romance", "comedy"],
    "great_expectations":       ["social_critique", "coming_of_age"],
    "bleak_house":              ["social_critique", "satire"],
    "war_and_peace":            ["epic", "war", "moral_philosophy"],
    "anna_karenina":            ["tragedy", "romance", "social_critique"],
    "crime_and_punishment":     ["existentialism", "guilt", "redemption"],
    "the_brothers_karamazov":   ["existentialism", "faith", "tragedy"],
    "madame_bovary":            ["tragedy", "romance", "social_critique"],
    "the_cherry_orchard":       ["comedy", "melancholy", "social_critique"],
    "the_seagull":              ["tragedy", "melancholy"],
    "the_trial":                ["existentialism", "alienation", "guilt"],
    "the_metamorphosis":        ["existentialism", "alienation"],
    "mrs_dalloway":             ["stream_of_consciousness", "mortality", "memory"],
    "to_the_lighthouse":        ["stream_of_consciousness", "mortality", "memory"],
    "ulysses":                  ["stream_of_consciousness", "homecoming", "comedy", "homer"],
    "dubliners":                ["alienation", "epiphany"],
    "the_waste_land":           ["alienation", "myth", "mortality"],

    # Themes
    "epic":                   ["heroism", "homecoming"],
    "tragedy":                [],
    "comedy":                 [],
    "romance":                [],
    "satire":                 [],
    "allegory":               [],
    "existentialism":         [],
    "alienation":             [],
    "stream_of_consciousness":[],
    "social_critique":        [],
    "moral_philosophy":       [],
    "humanism":               [],
    "myth":                   [],
    "heroism":                [],
    "homecoming":             [],
    "war":                    [],
    "revenge":                [],
    "guilt":                  ["redemption"],
    "redemption":             [],
    "ambition":               [],
    "fate":                   [],
    "duty":                   [],
    "idealism":               [],
    "irony":                  [],
    "mortality":              [],
    "memory":                 [],
    "melancholy":             [],
    "coming_of_age":          [],
    "afterlife":              [],
    "pilgrimage":             [],
    "faith":                  [],
    "beauty":                 [],
    "magic":                  [],
    "self_knowledge":         [],
    "epiphany":               [],
}


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for f in os.listdir(OUTPUT_DIR):
        if f.endswith(".dm"):
            os.remove(os.path.join(OUTPUT_DIR, f))

    for node, children in GRAPH.items():
        path = os.path.join(OUTPUT_DIR, f"{node}.dm")
        with open(path, "w") as f:
            for child in children:
                f.write(f"[{child}]\n")

    print(f"Generated {len(GRAPH)} nodes in {OUTPUT_DIR}/")
    print("Root tag: literature")


if __name__ == "__main__":
    main()
