import * as nodegraph from './nodegraph';

function getEdgeWndTarget() {
  return document.querySelector('.edge-edit-wnd').target;
}

function updateEdgeWnd() {
  const formEdgeNote = document.querySelector('.form-edge-note');
  const domEdge = getEdgeWndTarget();
  const { note } = domEdge.edge;
  // console.log('updateEdgeWnd', note);
  formEdgeNote.value = (note === undefined) ? '' : note;
}

function setEdgeWndTarget(domEdge) {
  document.querySelector('.edge-edit-wnd').target = domEdge;
}

function setNodeWndTarget(domNode) {
  document.querySelector('.node-edit-wnd').target = domNode;
}

function getNodeWndTarget() {
  return document.querySelector('.node-edit-wnd').target;
}

function updateNodeWnd(graph) {
  const domNode = getNodeWndTarget();
  const nodeData = nodegraph.getNodeData(graph, domNode.id);
  const formNodeNote = document.querySelector('.form-node-text');
  const formNodeImage = document.querySelector('.form-node-image');
  if (nodeData && nodeData.text) {
    formNodeNote.value = nodeData.text;
  } else {
    formNodeNote.value = '';
  }
  if (nodeData && nodeData.image) {
    formNodeImage.value = nodeData.image;
  } else {
    formNodeImage.value = '';
  }
}

export {
  getEdgeWndTarget,
  updateEdgeWnd,
  setEdgeWndTarget,
  setNodeWndTarget,
  getNodeWndTarget,
  updateNodeWnd,
};
