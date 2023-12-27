// returns undefined if not found
function getNodeData(graph, nodeid) {
  return graph.nodeData.find((record) => record.nodeid === nodeid);
}

// returns undefined if not found
function getEdgeStyle(graph, edgeid) {
  return graph.edgeStyles.find((record) => record.edgeid === edgeid);
}

export {
  getNodeData,
  getEdgeStyle,
};
