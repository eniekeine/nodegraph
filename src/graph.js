const graph = {
  nodes: [
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 500, y: 100 },
    { id: 3, x: 500, y: 300 },
    { id: 4, x: 600, y: 300 },
  ],
  edges: [
    [1, 2],
    [1, 3],
    [3, 4],
  ],
};

export default graph;
