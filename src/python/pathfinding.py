import heapq
import networkx as nx
import matplotlib.pyplot as plt

graph = {
    1: {2: 16, 3: 9},
    2: {1: 16, 4: 12, 5: 25},
    3: {1: 9, 4: 15, 6: 22},
    4: {1: 35, 2: 12, 3: 15, 5: 14, 6: 17, 7: 19},
    5: {2: 25, 4: 14, 7: 8},
    6: {3: 15, 4: 17, 7: 19},
    7: {4: 15, 5: 8, 6: 14}
}


def dijkstra(graph, start, end):
    min_heap = [(0, start)]
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous_nodes = {node: None for node in graph}

    while min_heap:
        current_distance, current_node = heapq.heappop(min_heap)

        if current_node == end:
            break

        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight

            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(min_heap, (distance, neighbor))

    path = []
    node = end
    while node is not None:
        path.append(node)
        node = previous_nodes[node]

    return distances[end], path[::-1]


start_node = 1
end_node = 7
dist, path = dijkstra(graph, start_node, end_node)
print(f"Min Distance: {dist}")
print(f"Shortest Path: {path}")

G = nx.DiGraph()

for node, neighbors in graph.items():
    for neighbor, weight in neighbors.items():
        G.add_edge(node, neighbor, weight=weight)

edge_colors = ['red' if (u, v) in zip(path, path[1:]) else 'black' for u, v in G.edges()]
edge_widths = [3 if (u, v) in zip(path, path[1:]) else 1 for u, v in G.edges()]

pos = nx.spring_layout(G)

plt.figure(figsize=(8, 6))
nx.draw(G, pos, with_labels=True, node_size=700, node_color='lightblue', font_size=12, font_weight='bold', arrowsize=20)
nx.draw_networkx_edge_labels(G, pos, edge_labels={(u, v): G[u][v]['weight'] for u, v in G.edges()})
nx.draw_networkx_edges(G, pos, edge_color=edge_colors, width=edge_widths)

plt.show()
