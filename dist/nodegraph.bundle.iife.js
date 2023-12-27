var nodegraph = (function (exports) {
  'use strict';

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

  var graphview = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getEdgeStyle: getEdgeStyle,
    getNode: getNode,
    getNodeData: getNodeData
  });

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
  let callbackNodeClicked = null;
  let callbackEdgeClicked = null;
  let callbackSelected = null;

  function setCallbackNodeClicked(callback) {
    callbackNodeClicked = callback;
  }

  function setCallbackEdgeClicked(callback) {
    callbackEdgeClicked = callback;
  }

  function setCallbackSelected(callback) {
    callbackSelected = callback;
  }

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
    if (item === null) { return; }
    selected = item;
    selected.classList.add('selected');
    callbackSelected(item);
  }

  function getCenterPosition(node) {
    // getBoundingClinetRect returns coordinate in client area(full window except for the title bar)
    // so we need to subtract the coordinate of the parent element
    // to get the coordinate within the parent element
    const parentRect = node.parentElement.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    return {
      x: (rect.left + rect.right) * 0.5 - parentRect.left,
      y: (rect.top + rect.bottom) * 0.5 - parentRect.top,
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
      domNodeContent.innerHTML = nodedata.text.replace(/\n/g, '<br />');
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
    domNode.id = id;
    domNode.style.left = `${x + panX}px`;
    domNode.style.top = `${y + panY}px`;
    if (w) domNode.style.width = `${w}px`;
    if (h) domNode.style.height = `${h}px`;
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
      domEdge.id = edge.id;
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

  function clearGraph() {
    loadedGraph = null;
    domNodes.forEach((domNode) => domNode.remove());
    domEdges.forEach((domEdge) => domEdge.remove());
    domNodes.length = 0;
    domEdges.length = 0;
  }

  function setGraph(graph) {
    clearGraph();
    loadedGraph = graph;
    makeDomNodes(graph);
    makeDomEdges(graph);
  }

  function updatePan(dx, dy) {
    panX += dx;
    panY += dy;
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

  function setFrameSize(width, height) {
    frameWidth = width;
    frameHeight = height;
    const frame = document.querySelector('.frame');
    frame.style.width = `${frameWidth}px`;
    frame.style.height = `${frameHeight}px`;
  }

  function initFrame(frame, graph) {
    setGraph(graph);

    mouseupToken = frame.addEventListener('mouseup', (event) => {
      const domNode = event.target.closest('.node');
      const domEdge = event.target.closest('.edge');
      if (domNode) {
        selectItem(domNode);
        if (callbackNodeClicked) callbackNodeClicked(domNode);
      } else if (domEdge) {
        selectItem(domEdge);
        if (callbackEdgeClicked) callbackEdgeClicked(domEdge);
      } else {
        selectItem(null);
      }
    });

    mousedownToken = frame.addEventListener('mousedown', (event) => {
      downItem = event.target;
    });

    mousemoveToken = frame.addEventListener('mousemove', (event) => {
      if (event.buttons === 1 && downItem === frame) {
        updatePan(event.movementX, event.movementY);
      }
    });
  }

  function freeFrame(frame) {
    frame.removeEventListener('mouseup', mouseupToken);
    frame.removeEventListener('mousemove', mousemoveToken);
    frame.removeEventListener('mousedown', mousedownToken);
    clearGraph();
  }

  var domgraph = /*#__PURE__*/Object.freeze({
    __proto__: null,
    freeFrame: freeFrame,
    initFrame: initFrame,
    setCallbackEdgeClicked: setCallbackEdgeClicked,
    setCallbackNodeClicked: setCallbackNodeClicked,
    setCallbackSelected: setCallbackSelected,
    setFrameSize: setFrameSize,
    setGraph: setGraph,
    updatePan: updatePan
  });

  exports.domgraph = domgraph;
  exports.graphview = graphview;

  return exports;

})({});
