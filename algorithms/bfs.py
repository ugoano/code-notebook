def bfs(edges):
    edges_dict = {edges[ind]: edges[ind+1] for ind in range(0, len(edges), 2)}
    import pdb; pdb.set_trace()
    return edges_dict


bfs([0, 1, 0, 2, 0, 3, 2, 4])
