def solution(A, B, N):
    nodes = {}
    for i in range(0, len(A)):
        if A[i] not in nodes:
            nodes[A[i]] = [B[i]]
        else:
            nodes[A[i]].append(B[i])
        if B[i] not in nodes:
            nodes[B[i]] = [A[i]]
        else:
            nodes[B[i]].append(A[i])
    visited_nodes = []
    max_edges = 0
    for node in nodes.keys():
        visited_edges = []
        if node in visited_nodes:
            continue
        visited_edges = visit_edges(node, visited_nodes, nodes, visited_edges)
        visited_nodes.append(node)
        print(f"Visited edges of {node} is {visited_edges}")
        max_edges = max(max_edges, len(visited_edges))
    return max_edges


def visit_edges(selected_node, visited_nodes, nodes, visited_edges):
    new_edges = []
    visited_nodes.append(selected_node)
    for connected_node in nodes[selected_node]:
        if {selected_node, connected_node} not in visited_edges:
            visited_edges.append({selected_node, connected_node})
        if connected_node in visited_nodes:
            continue
        visit_edges(connected_node, visited_nodes, nodes, visited_edges)
    return visited_edges


print(solution([1, 2, 3, 3], [2, 3, 1, 4], 4))
