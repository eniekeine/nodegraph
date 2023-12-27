// reutrns undefined if not found
function getNode(graph, nodeid) {
  return graph.nodes.find((record) => record.id === nodeid);
}
// returns undefined if not found
function getNodeData(graph, nodeid) {
  return graph.nodeData.find((record) => record.nodeid === nodeid);
}

// returns undefined if not found
function getEdgeStyle(graph, edgeid) {
  return graph.edgeStyles.find((record) => record.edgeid === edgeid);
}

export {
  getNode,
  getNodeData,
  getEdgeStyle,
};
