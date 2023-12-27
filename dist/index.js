(function () {
  'use strict';

  // reutrns undefined if not found
  // returns undefined if not found
  function getNodeData(graph, nodeid) {
    return graph.nodeData.find((record) => record.nodeid === nodeid);
  }

  // returns undefined if not found
  function getEdgeStyle(graph, edgeid) {
    return graph.edgeStyles.find((record) => record.edgeid === edgeid);
  }

  const domNodes = [];
  const domEdges = [];
  let loadedGraph = null;
  let panX = 0;
  let panY = 0;
  let selected = null;
  let downItem = null;
  let callbackSelectionChanged = null;

  function setCallbackSelectionChanged(callback) {
    callbackSelectionChanged = callback;
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
    selected = item;
    if (item) item.classList.add('selected');
    callbackSelectionChanged(item);
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
    domNode.node = node;
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

  function updateDomEdge(graph, domEdge) {
    const { edge } = domEdge;
    const pos0 = getNodePosition(edge.fromto[0]);
    const pos1 = getNodePosition(edge.fromto[1]);
    const dx = pos1.x - pos0.x;
    const dy = pos1.y - pos0.y;
    const l = dx * dx + dy * dy;
    const alpha = Math.atan2(dy, dx);
    domEdge.classList.add('edge');
    const edgeStyle = getEdgeStyle(graph, edge.id);
    if (edgeStyle && edgeStyle.class !== undefined) {
      domEdge.classList.add(edgeStyle.class);
    }
    domEdge.style.left = `${pos0.x}px`;
    domEdge.style.top = `${pos0.y}px`;
    domEdge.style.transform = `rotate(${alpha}rad)`;
    domEdge.style.width = `${Math.sqrt(l)}px`;
  }

  function makeDomEdges(graph) {
    for (let i = 0; i < graph.edges.length; i += 1) {
      const edge = graph.edges[i];
      const domEdge = document.createElement('div');
      domEdge.edge = edge;
      updateDomEdge(graph, domEdge);
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
      const domNode = domNodes[i];
      domNode.style.left = `${domNode.node.x + panX}px`;
      domNode.style.top = `${domNode.node.y + panY}px`;
    }
    for (let i = 0; i < domEdges.length; i += 1) {
      const domEdge = domEdges[i];
      updateDomEdge(loadedGraph, domEdge);
    }
  }

  function initFrame(frame, graph) {
    setGraph(graph);
    frame.addEventListener('mouseup', (event) => {
      downItem = null;
      const domNode = event.target.closest('.node');
      const domEdge = event.target.closest('.edge');
      if (domNode) {
        selectItem(domNode);
      } else if (domEdge) {
        selectItem(domEdge);
      } else {
        selectItem(null);
      }
    });

    frame.addEventListener('mousedown', (event) => {
      downItem = event.target;
    });

    frame.addEventListener('mousemove', (event) => {
      if (event.buttons === 1) {
        const domNode = downItem.closest('.node');
        if (downItem === frame) {
          updatePan(event.movementX, event.movementY);
        } else if (domNode) {
          console.log(`move node ${domNode.node.id}`);
          domNode.node.x += event.movementX;
          domNode.node.y += event.movementY;
          updatePan(0, 0);
        }
      }
    });
  }

  function playBlip() {
    document.querySelector('.blipg3').play();
  }

  function onSelectionChanged(graph, domItem) {
    if (!domItem) {
      console.log('deselected');
      // if domItem is null, it means user deselected by clicking on empty space.
      const nodeDataText = document.querySelector('.node-data-text');
      nodeDataText.value = '';
    } else if (domItem.classList.contains('node')) {
      console.log(`node selected : ${domItem.id}`);
      // if domItem has 'node' class, user selected a node
      const nodeDataText = document.querySelector('.node-data-text');
      const nodedata = getNodeData(graph, domItem.id);
      if (nodedata) {
      // ※ (null, 2) means pretty-print with 2-space indent
        nodeDataText.value = JSON.stringify(nodedata, null, 2);
      } else {
        nodeDataText.value = '';
      }
      playBlip();
    } else if (domItem.classList.contains('edge')) {
      // if domItem has 'edge' class, user selected an edge
      console.log(`edge selected : ${domItem.id}`);
      playBlip();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const frame = document.querySelector('.frame');
    fetch('/example/basic.json')
      .then((response) => response.json())
      .then((graph) => {
        // initFrame must be called with frame element before any other calls
        initFrame(frame, graph);

        // optional. set callback function to be called when selection is changed.
        setCallbackSelectionChanged((domItem) => {
          onSelectionChanged(graph, domItem);
        });

        document.querySelector('.btn-download').addEventListener('click', () => {
          const content = JSON.stringify(graph, null, 2);
          const a = document.createElement('a');
          const file = new Blob([content], { type: 'text/plain' });
          a.href = URL.createObjectURL(file);
          a.download = 'graph.json';
          a.click();
        });

        document.querySelector('.btn-upload').addEventListener('click', () => {
          const fileInput = document.getElementById('file-input');
          const file = fileInput.files[0];

          if (!file) {
            // console.log('No file selected!');
            return;
          }

          const reader = new FileReader();

          reader.onload = (event) => {
            try {
              setGraph(JSON.parse(event.target.result));
            } catch (e) {
              console.error('Error parsing JSON!', e);
            }
          };

          reader.onerror = function () {
            console.error('Error reading file!');
          };

          reader.readAsText(file);
        });
      });
  });

})();
