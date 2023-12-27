import graph from './graph';

const domNodes = [];
const domEdges = [];
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

function createNode(id, x, y) {
  const node = document.createElement('div');
  node.classList.add('node');
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.id = id;
  return node;
}

function makeNodes() {
  const frame = document.querySelector('.frame');
  for (let i = 0; i < graph.nodes.length; i += 1) {
    const jsonNode = graph.nodes[i];
    const node = createNode(jsonNode.id, jsonNode.x, jsonNode.y);
    domNodes.push(node);
    frame.appendChild(node);
  }
}

function getNodePosition(id) {
  const node = document.getElementById(id);
  return getCenterPosition(node);
}

function makeEdges() {
  for (let i = 0; i < graph.edges.length; i += 1) {
    const pos0 = getNodePosition(graph.edges[i][0]);
    const pos1 = getNodePosition(graph.edges[i][1]);
    const dx = pos1.x - pos0.x;
    const dy = pos1.y - pos0.y;
    const l = dx * dx + dy * dy;
    const alpha = Math.atan2(dy, dx);
    const div = document.createElement('div');
    div.classList.add('edge');
    div.style.left = `${pos0.x}px`;
    div.style.top = `${pos0.y}px`;
    div.style.transform = `rotate(${alpha}rad)`;
    div.style.width = `${Math.sqrt(l)}px`;
    domEdges.push(div);
    const frame = document.querySelector('.frame');
    frame.insertBefore(div, frame.firstChild);
  }
}

function updateGraph() {
  for (let i = 0; i < domNodes.length; i += 1) {
    const node = domNodes[i];
    const jsonNode = graph.nodes[i];
    node.style.left = `${jsonNode.x + panX}px`;
    node.style.top = `${jsonNode.y + panY}px`;
  }
  for (let i = 0; i < domEdges.length; i += 1) {
    const edge = domEdges[i];
    const jsonEdge = graph.edges[i];
    const pos0 = getNodePosition(jsonEdge[0]);
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

function initFrame(frame) {
  mouseupToken = frame.addEventListener('mouseup', (event) => {
    if (event.target.classList.contains('node')
    || event.target.classList.contains('edge')) {
      playBlip();
      selectItem(event.target);
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
  initFrame, freeGraph, makeNodes, makeEdges, updateGraph, updatePan, setFrameSize, setSoundBlipUrl,
};
