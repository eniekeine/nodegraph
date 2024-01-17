(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.nodegraph = {}));
})(this, (function (exports) { 'use strict';

  const state = {
    nodeNeedContentUpdate: [],
  };
  /* eslint-disable no-param-reassign */
  // reutrns undefined if not found
  function getNode(graph, nodeid) {
    return graph.nodes.find((record) => record.id === nodeid);
  }

  // returns undefined if not found
  function getNodeData(graph, nodeid) {
    return graph.nodeData.find((record) => record.nodeid === nodeid);
  }

  function makeNodeData(graph, nodeid) {
    const nodeData = {
      nodeid,
    };
    graph.nodeData.push(nodeData);
    return nodeData;
  }

  // returns undefined if not found
  function getEdge(graph, edgeid) {
    return graph.edges.find((record) => record.id === edgeid);
  }

  // returns undefined if not found
  function findEdge(graph, fromNodeId, toNodeId) {
    return graph.edges.find((record) => (record.fromto[0] === fromNodeId
      && record.fromto[1] === toNodeId)
      || (record.fromto[0] === toNodeId
      && record.fromto[1] === fromNodeId));
  }

  async function makred(src) {
    const urlMarked = 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';
    const module = await import(urlMarked);
    return module.parse(src);
  }

  function findEdgesByNode(graph, nodeId) {
    return graph.edges.filter((record) => record.fromto[0] === nodeId || record.fromto[1] === nodeId);
  }

  function removeEdge(graph, edgeId) {
    graph.edges.splice(graph.edges.findIndex((record) => record.id === edgeId), 1);
  }

  function removeNode(graph, nodeId) {
    graph.nodes.splice(graph.nodes.findIndex((record) => record.id === nodeId), 1);
    graph.nodeData.splice(graph.nodes.findIndex((record) => record.nodeid === nodeId), 1);
    const edges = findEdgesByNode(graph, nodeId);
    for (let i = 0; i < edges.length; i += 1) {
      removeEdge(graph, edges[i].id);
    }
  }

  // returns undefined if not found
  function getEdgeStyle(graph, edgeid) {
    return graph.edgeStyles.find((record) => record.edgeid === edgeid);
  }

  function resetSelect(frame) {
    const selectedItems = document.querySelectorAll('.selected');
    for (let i = 0; i < selectedItems.length; i += 1) {
      selectedItems[i].classList.remove('selected');
    }
    frame.selected = null;
  }

  function selectItem(frame, item, reselect = false) {
    if (reselect === false && frame.selected === item) { return; }
    resetSelect(frame);
    frame.selected = item;
    if (item) item.classList.add('selected');
    if (frame.callbackSelectionChanged) { frame.callbackSelectionChanged(item); }
  }

  function getCenterPosition(domNode) {
    // getBoundingClinetRect returns coordinate in client area(full window except for the title bar)
    // so we need to subtract the coordinate of the parent element
    // to get the coordinate within the parent element
    const parentRect = domNode.parentElement.getBoundingClientRect();
    const rect = domNode.getBoundingClientRect();
    return {
      x: (rect.left + rect.right) * 0.5 - parentRect.left,
      y: (rect.top + rect.bottom) * 0.5 - parentRect.top,
    };
  }

  async function makeDomNodeContent(graph, node) {
    const nodedata = getNodeData(graph, node.id);
    const domNodeContentContainer = document.createElement('div');
    domNodeContentContainer.classList.add('node-content-container');
    // default : display node id
    if (!nodedata) {
      const domNodeContent = document.createElement('div');
      domNodeContent.classList.add('node-content-text');
      domNodeContent.textContent = node.id;
      domNodeContentContainer.appendChild(domNodeContent);
    } else if (nodedata.markdown) {
      const domNodeContent = document.createElement('div');
      domNodeContent.classList.add('node-content-markdown');
      const html = await makred(nodedata.markdown);
      domNodeContent.innerHTML = html;
      domNodeContentContainer.appendChild(domNodeContent);
    } else if (nodedata.text) {
      const domNodeContent = document.createElement('div');
      domNodeContent.classList.add('node-content-text');
      domNodeContent.innerHTML = nodedata.text.replace(/\n/g, '<br />');
      domNodeContentContainer.appendChild(domNodeContent);
    } else if (nodedata.image) {
      const domNodeContent = document.createElement('img');
      domNodeContent.classList.add('node-content-image');
      domNodeContent.src = nodedata.image;
      domNodeContentContainer.appendChild(domNodeContent);
    } else if (nodedata.html) {
      const domNodeContent = document.createElement('div');
      domNodeContent.innerHTML = nodedata.html;
      domNodeContentContainer.appendChild(domNodeContent);
    }
    return domNodeContentContainer;
  }

  async function makeDomNode(frame, node) {
    const {
      id, x, y, w, h,
    } = node;
    const domNode = document.createElement('div');
    domNode.classList.add('node');
    domNode.id = id;
    domNode.style.left = `${x + frame.panX}px`;
    domNode.style.top = `${y + frame.panY}px`;
    if (w) domNode.style.width = `${w}px`;
    if (h) domNode.style.height = `${h}px`;
    domNode.frame = frame;
    domNode.node = node;
    const domNodeContent = await makeDomNodeContent(frame.graph, node);
    if (domNodeContent) domNode.appendChild(domNodeContent);
    return domNode;
  }

  async function makeDomNodes(frame, graph) {
    const promises = [];
    for (let i = 0; i < graph.nodes.length; i += 1) {
      const node = graph.nodes[i];
      promises.push(makeDomNode(frame, node).then((domNode) => {
        frame.appendChild(domNode);
      }));
    }
    await Promise.all(promises);
  }

  function getNodePosition(nodeid) {
    const node = document.getElementById(nodeid);
    return getCenterPosition(node);
  }

  // apply what node data to domNode.
  async function updateDomNode(domNode, updatePosition = true, updateContent = true) {
    const { frame } = domNode;
    if (updateContent) {
      const nodeContent = await makeDomNodeContent(frame.graph, domNode.node);
      domNode.innerHTML = '';
      domNode.appendChild(nodeContent);
    }
    if (updatePosition) {
      domNode.style.left = `${domNode.node.x + frame.panX}px`;
      domNode.style.top = `${domNode.node.y + frame.panY}px`;
    }
  }

  function augmentDomEdgeNote(domEdge, note) {
    const domNote = document.createElement('div');
    domNote.classList.add('edge-note');
    domNote.textContent = note;
    domEdge.appendChild(domNote);
    domEdge.domNote = domNote;
  }

  function updateDomEdge(domEdge) {
    const { edge, style } = domEdge;
    const pos0 = getNodePosition(edge.fromto[0]);
    const pos1 = getNodePosition(edge.fromto[1]);
    const dx = pos1.x - pos0.x;
    const dy = pos1.y - pos0.y;
    // length of the edge
    const l = dx * dx + dy * dy;
    // radian angle of the edge rotation
    const alpha = Math.atan2(dy, dx);
    domEdge.classList.add('edge');
    const edgeStyle = getEdgeStyle(domEdge.frame.graph, edge.id);
    if (edgeStyle && edgeStyle.class !== undefined) {
      domEdge.classList.add(edgeStyle.class);
    }
    // edge origin is at pos0
    style.left = `${pos0.x}px`;
    style.top = `${pos0.y}px`;
    style.transform = `rotate(${alpha}rad)`;
    style.width = `${Math.sqrt(l)}px`;
    if (domEdge.domNote) {
      const { domNote } = domEdge;
      domNote.innerHTML = edge.note;
    } else if (edge.note !== undefined) {
      augmentDomEdgeNote(domEdge, edge.note);
    }
  }

  function makeDomEdge(frame, edge) {
    const domEdge = document.createElement('div');
    domEdge.frame = frame;
    domEdge.edge = edge;
    domEdge.id = edge.id;
    if (edge.note) augmentDomEdgeNote(domEdge, edge.note);
    return domEdge;
  }

  function makeDomEdges(frame, graph) {
    for (let i = 0; i < graph.edges.length; i += 1) {
      const edge = graph.edges[i];
      const domEdge = makeDomEdge(frame, edge);
      frame.insertBefore(domEdge, frame.firstChild);
      updateDomEdge(domEdge);
    }
  }

  async function setGraph(frame, graph) {
    frame.innerHTML = '';
    frame.graph = graph;
    await makeDomNodes(frame, graph);
    makeDomEdges(frame, graph);
  }

  async function updateFrame(frame) {
    const domNodes = frame.querySelectorAll('.node');
    for (let i = 0; i < frame.graph.nodes.length; i += 1) {
      const node = frame.graph.nodes[i];
      let domNode = document.getElementById(node.id);
      if (domNode) {
        // update content of existing node
        updateDomNode(domNode, true, false);
      } else {
        // create new node that are in the graph
        domNode = await makeDomNode(frame, node);
        frame.appendChild(domNode);
      }
    }
    state.nodeNeedContentUpdate.forEach((domNode) => {
      updateDomNode(domNode, false, true);
    });
    state.nodeNeedContentUpdate = [];
    // delete nodes that are not in the graph
    for (let i = 0; i < domNodes.length; i += 1) {
      const domNode = domNodes[i];
      if (frame.graph.nodes.includes(domNode.node) === false) { domNode.remove(); }
    }
    const domEdges = frame.querySelectorAll('.edge');
    for (let i = 0; i < frame.graph.edges.length; i += 1) {
      const edge = frame.graph.edges[i];
      let domEdge = document.getElementById(edge.id);
      if (domEdge) {
        updateDomEdge(domEdge);
      } else {
        domEdge = makeDomEdge(frame, edge);
        frame.insertBefore(domEdge, frame.firstChild);
        updateDomEdge(domEdge);
      }
    }
    for (let i = 0; i < domEdges.length; i += 1) {
      const domEdge = domEdges[i];
      if (frame.graph.edges.includes(domEdge.edge) === false) { domEdge.remove(); }
    }
  }

  function addDomNode(frame, x, y) {
    let id = 1;
    while (getNode(frame.graph, `n${id}`) !== undefined) id += 1;
    const newNode = { id: `n${id}`, x, y };
    frame.graph.nodes.push(newNode);
    return newNode;
  }

  function initFrame(frame) {
    frame.panX = 0;
    frame.panY = 0;
    frame.selected = null;
    frame.dragBeginNode = null;
    frame.callbackNodeClicked = null;
    frame.callbackEdgeClicked = null;
    frame.callbackSelectionChanged = null;
    frame.mousedownTarget = null;
    frame.addEventListener('mouseup', (event) => {
      const domNode = event.target.closest('.node');
      const domEdge = event.target.closest('.edge');
      if (event.ctrlKey) {
        if (frame.dragBeginNode && frame.dragBeginNode !== domNode) {
          const x = event.clientX - frame.getBoundingClientRect().left - frame.panX;
          const y = event.clientY - frame.getBoundingClientRect().top - frame.panY;
          const newNode = addDomNode(frame, x, y);
          const srcNodeData = getNodeData(frame.graph, frame.dragBeginNode.node.id);
          if (srcNodeData) {
            const dstNodeData = makeNodeData(frame.graph, newNode.id);
            dstNodeData.text = srcNodeData.text;
            dstNodeData.image = srcNodeData.image;
            updateFrame(frame);
          }
        }
      } else if (event.shiftKey) {
        if (domNode && frame.dragBeginNode && frame.dragBeginNode !== domNode) {
          const downDomNode = frame.dragBeginNode;
          if (downDomNode) {
            let edge = findEdge(frame.graph, downDomNode.id, domNode.id);
            if (!edge) {
              let id = 1;
              while (getEdge(frame.graph, `e${id}`) !== undefined) id += 1;
              edge = {
                id: `e${id}`,
                fromto: [downDomNode.id, domNode.id],
              };
              frame.graph.edges.push(edge);
              updateFrame(frame);
            }
          }
        }
      } else if (domNode) {
        selectItem(frame, domNode);
        if (frame.callbackNodeClicked) frame.callbackNodeClicked(domNode);
      } else if (domEdge) {
        selectItem(frame, domEdge);
        if (frame.callbackEdgeClicked) frame.callbackEdgeClicked(domEdge);
      } else {
        selectItem(frame, null);
      }
      frame.dragBeginNode = null;
      const ghostEdge = frame.querySelector('.ghost-edge');
      if (ghostEdge) ghostEdge.remove();
      frame.style.cursor = 'default';
    });

    document.addEventListener('keyup', (event) => {
      // console.log('keyup');
      if (frame.selected && event.key === 'Delete') {
        if (frame.selected.classList.contains('node')) {
          removeNode(frame.graph, frame.selected.id);
        } else if (frame.selected.classList.contains('edge')) {
          removeEdge(frame.graph, frame.selected.id);
        }
        updateFrame(frame);
      }
    });

    frame.addEventListener('mousedown', (event) => {
      frame.mousedownTarget = event.target;
      frame.dragBeginNode = event.target.closest('.node');
      if (frame.dragBeginNode && event.shiftKey) {
        const ghostEdge = document.createElement('div');
        ghostEdge.classList.add('hidden');
        ghostEdge.classList.add('ghost-edge');
        frame.insertBefore(ghostEdge, frame.firstChild);
      } else if (frame.dragBeginNode && event.ctrlKey) {
        frame.style.cursor = 'copy';
      }
    });

    frame.addEventListener('mousemove', (event) => {
      if (event.buttons === 1) {
        const domNode = frame.dragBeginNode;
        if (frame.dragBeginNode) {
          // console.log(`move node ${domNode.node.id}`);
          if (event.shiftKey) {
            const downDomNode = frame.dragBeginNode.closest('.node');
            if (downDomNode) {
              const frameRect = frame.getBoundingClientRect();
              const ghostEdge = frame.querySelector('.ghost-edge');
              const pos0 = getCenterPosition(downDomNode);
              const dx = event.clientX - frameRect.left - pos0.x;
              const dy = event.clientY - frameRect.top - pos0.y;
              ghostEdge.classList.remove('hidden');
              ghostEdge.style.left = `${pos0.x}px`;
              ghostEdge.style.top = `${pos0.y}px`;
              ghostEdge.style.width = `${Math.sqrt(dx * dx + dy * dy)}px`;
              ghostEdge.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
            }
          } else if (event.ctrlKey) ; else {
            domNode.node.x += event.movementX;
            domNode.node.y += event.movementY;
          }
        } else if (frame.mousedownTarget === frame) {
          // panning
          frame.panX += event.movementX;
          frame.panY += event.movementY;
        }
        updateFrame(frame);
      }
      event.preventDefault();
    });

    frame.addEventListener('dblclick', (event) => {
      const domNode = event.target.closest('.node');
      if (domNode) {
        if (frame.callbackNodeDoubleClicked) frame.callbackNodeDoubleClicked(domNode);
        return;
      }

      const domEdge = event.target.closest('.edge');
      if (domEdge) {
        if (frame.callbackEdgeDoubleClicked) frame.callbackEdgeDoubleClicked(domEdge);
        return;
      }

      const x = event.clientX - frame.getBoundingClientRect().left - frame.panX;
      const y = event.clientY - frame.getBoundingClientRect().top - frame.panY;
      addDomNode(frame, x, y);
      updateFrame(frame);
    });
  }

  function setEdgeNote(domEdge, note) {
    const { edge } = domEdge;
    edge.note = note;
    updateDomEdge(domEdge);
  }

  function setNodeText(domNode, text) {
    let nodeData = getNodeData(domNode.frame.graph, domNode.id);
    if (nodeData === undefined) nodeData = makeNodeData(domNode.frame.graph, domNode.id);
    state.nodeNeedContentUpdate.push(domNode);
    nodeData.text = text;
  }

  function setNodeImage(domNode, image) {
    let nodeData = getNodeData(domNode.frame.graph, domNode.id);
    if (nodeData === undefined) nodeData = makeNodeData(domNode.frame.graph, domNode.id);
    nodeData.image = image;
    state.nodeNeedContentUpdate.push(domNode);
  }

  function setNodeMarkDown(domNode, markdown) {
    let nodeData = getNodeData(domNode.frame.graph, domNode.id);
    if (nodeData === undefined) nodeData = makeNodeData(domNode.frame.graph, domNode.id);
    nodeData.markdown = markdown;
    state.nodeNeedContentUpdate.push(domNode);
  }

  function newGraph() {
    return {
      nodes: [],
      nodeData: [],
      edgeStyles: [],
      edges: [],
    };
  }

  exports.getEdge = getEdge;
  exports.getEdgeStyle = getEdgeStyle;
  exports.getNode = getNode;
  exports.getNodeData = getNodeData;
  exports.initFrame = initFrame;
  exports.newGraph = newGraph;
  exports.setEdgeNote = setEdgeNote;
  exports.setGraph = setGraph;
  exports.setNodeImage = setNodeImage;
  exports.setNodeMarkDown = setNodeMarkDown;
  exports.setNodeText = setNodeText;
  exports.updateDomNode = updateDomNode;
  exports.updateFrame = updateFrame;

}));
