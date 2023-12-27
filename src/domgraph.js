import { getNodeData, getEdgeStyle } from './graphview';

const domNodes = [];
const domEdges = [];
let loadedGraph = null;
let panX = 0;
let panY = 0;
let frameWidth = 800;
let frameHeight = 600;
let selected = null;
let mouseupToken = null;
let mousemoveToken = null;
let mousedownToken = null;
let downItem = null;
let soundBlipUrl = null;
let callbackNodeClicked = null;
let callbackEdgeClicked = null;

function setCallbackNodeClicked(callback) {
  callbackNodeClicked = callback;
}

function setCallbackEdgeClicked(callback) {
  callbackEdgeClicked = callback;
}

function setSoundBlipUrl(url) { soundBlipUrl = url; }

function resetSelect() {
  const selectedItems = document.querySelectorAll('.selected');
  for (let i = 0; i < selectedItems.length; i += 1) {
    selectedItems[i].classList.remove('selected');
  }
  selected = null;
}

function selectItem(item, reselect = false) {
  if (reselect === false && selected === item) { return; }
  resetSelect();
  selected = item;
  selected.classList.add('selected');
}

function getCenterPosition(node) {
  const rect = node.getBoundingClientRect();
  return {
    x: (rect.left + rect.right) * 0.5,
    y: (rect.top + rect.bottom) * 0.5,
  };
}

function makeDomNodeContent(graph, node) {
  const nodedata = getNodeData(graph, node.id);
  // default : display node id
  if (!nodedata) {
    const domNodeContent = document.createElement('div');
    domNodeContent.classList.add('node-content-text');
    domNodeContent.textContent = node.id;
    return domNodeContent;
  }
  if (nodedata.text) {
    const domNodeContent = document.createElement('div');
    domNodeContent.classList.add('node-content-text');
    domNodeContent.textContent = nodedata.text;
    return domNodeContent;
  }
  if (nodedata.image) {
    const domNodeContent = document.createElement('img');
    domNodeContent.classList.add('node-content-image');
    domNodeContent.src = nodedata.image;
    return domNodeContent;
  }
  if (nodedata.html) {
    const domNodeContent = document.createElement('div');
    domNodeContent.innerHTML = nodedata.html;
    return domNodeContent;
  }
  return null;
}

function makeDomNode(graph, node) {
  const {
    id, x, y, w, h,
  } = node;
  const domNode = document.createElement('div');
  domNode.classList.add('node');
  domNode.style.left = `${x}px`;
  domNode.style.top = `${y}px`;
  if (w) domNode.style.width = `${w}px`;
  if (h) domNode.style.height = `${h}px`;
  domNode.id = id;
  const domNodeContent = makeDomNodeContent(graph, node);
  if (domNodeContent) domNode.appendChild(domNodeContent);
  return domNode;
}

function makeDomNodes(graph) {
  const frame = document.querySelector('.frame');
  for (let i = 0; i < graph.nodes.length; i += 1) {
    const node = graph.nodes[i];
    const domNode = makeDomNode(graph, node);
    domNodes.push(domNode);
    frame.appendChild(domNode);
  }
}

function getNodePosition(nodeid) {
  const node = document.getElementById(nodeid);
  return getCenterPosition(node);
}

function makeDomEdges(graph) {
  for (let i = 0; i < graph.edges.length; i += 1) {
    const edge = graph.edges[i];
    const pos0 = getNodePosition(edge.fromto[0]);
    const pos1 = getNodePosition(edge.fromto[1]);
    const dx = pos1.x - pos0.x;
    const dy = pos1.y - pos0.y;
    const l = dx * dx + dy * dy;
    const alpha = Math.atan2(dy, dx);
    const domEdge = document.createElement('div');
    domEdge.classList.add('edge');
    const edgeStyle = getEdgeStyle(graph, edge.id);
    if (edgeStyle && edgeStyle.class !== undefined) {
      domEdge.classList.add(edgeStyle.class);
    }
    domEdge.style.left = `${pos0.x}px`;
    domEdge.style.top = `${pos0.y}px`;
    domEdge.style.transform = `rotate(${alpha}rad)`;
    domEdge.style.width = `${Math.sqrt(l)}px`;
    domEdges.push(domEdge);
    const frame = document.querySelector('.frame');
    frame.insertBefore(domEdge, frame.firstChild);
  }
}

function updateGraph() {
  for (let i = 0; i < domNodes.length; i += 1) {
    const node = domNodes[i];
    const jsonNode = loadedGraph.nodes[i];
    node.style.left = `${jsonNode.x + panX}px`;
    node.style.top = `${jsonNode.y + panY}px`;
  }
  for (let i = 0; i < domEdges.length; i += 1) {
    const edge = domEdges[i];
    const jsonEdge = loadedGraph.edges[i];
    const pos0 = getNodePosition(jsonEdge.fromto[0]);
    edge.style.left = `${pos0.x}px`;
    edge.style.top = `${pos0.y}px`;
  }
}

function updatePan(dx, dy) {
  panX += dx;
  panY += dy;
}

function setFrameSize(width, height) {
  frameWidth = width;
  frameHeight = height;
  const frame = document.querySelector('.frame');
  frame.style.width = `${frameWidth}px`;
  frame.style.height = `${frameHeight}px`;
}

function playBlip() {
  const audio = new Audio(soundBlipUrl);
  audio.play();
}

function initFrame(frame, graph) {
  loadedGraph = graph;
  makeDomNodes(graph);
  makeDomEdges(graph);

  mouseupToken = frame.addEventListener('mouseup', (event) => {
    const node = event.target.closest('.node');
    const edge = event.target.closest('.edge');
    if (node) {
      playBlip();
      selectItem(node);
      if (callbackNodeClicked) callbackNodeClicked(node);
    } else if (edge) {
      playBlip();
      selectItem(edge);
      if (callbackEdgeClicked) callbackEdgeClicked(edge);
    }
  });

  mousedownToken = frame.addEventListener('mousedown', (event) => {
    downItem = event.target;
  });

  mousemoveToken = frame.addEventListener('mousemove', (event) => {
    if (event.buttons === 1 && downItem === frame) {
      updatePan(event.movementX, event.movementY);
      updateGraph();
    }
  });
}

function freeGraph(frame) {
  frame.removeEventListener('mouseup', mouseupToken);
  frame.removeEventListener('mousemove', mousemoveToken);
  frame.removeEventListener('mousedown', mousedownToken);
}

export {
  initFrame,
  freeGraph,
  updateGraph,
  updatePan,
  setFrameSize,
  setSoundBlipUrl,
  setCallbackNodeClicked,
  setCallbackEdgeClicked,
};
