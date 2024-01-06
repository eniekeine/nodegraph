(function () {
  'use strict';

  /* eslint-disable no-param-reassign */
  // reutrns undefined if not found

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
  function findEdge(graph, fromNodeId, toNodeId) {
    return graph.edges.find((record) => (record.fromto[0] === fromNodeId
      && record.fromto[1] === toNodeId)
      || (record.fromto[0] === toNodeId
      && record.fromto[1] === fromNodeId));
  }

  function findEdgesByNode(graph, nodeId) {
    return graph.edges.filter((record) => record.fromto[0] === nodeId || record.fromto[1] === nodeId);
  }

  function removeEdge(graph, edgeId) {
    graph.edges.splice(graph.edges.findIndex((record) => record.id === edgeId), 1);
  }

  function removeNode(graph, nodeId) {
    graph.nodes.splice(graph.nodes.findIndex((record) => record.id === nodeId), 1);
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

  function makeDomNode(frame, graph, node) {
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
    domNode.graph = graph;
    domNode.node = node;
    const domNodeContent = makeDomNodeContent(graph, node);
    if (domNodeContent) domNode.appendChild(domNodeContent);
    return domNode;
  }

  function makeDomNodes(frame, graph) {
    for (let i = 0; i < graph.nodes.length; i += 1) {
      const node = graph.nodes[i];
      const domNode = makeDomNode(frame, graph, node);
      frame.appendChild(domNode);
    }
  }

  function getNodePosition(nodeid) {
    const node = document.getElementById(nodeid);
    return getCenterPosition(node);
  }

  // apply what node data to domNode.
  function updateDomNode(domNode) {
    const { graph, frame } = domNode;
    // get node data
    const nodeData = getNodeData(graph, domNode.id);
    if (nodeData && nodeData.text && nodeData.text !== '') {
      // if node data has text property, display it
      const elemText = domNode.querySelector('.node-content-text');
      elemText.innerHTML = nodeData.text.replace(/\n/g, '<br />');
    } else if (nodeData && nodeData.image && nodeData.image !== '') {
      // if node data has image property, display it
      const elemImage = domNode.querySelector('.node-content-image');
      elemImage.src = nodeData.image;
    } else {
      const elemText = domNode.querySelector('.node-content-text');
      elemText.innerHTML = domNode.id;
    }
    // node position is at (node.x, node.y) + (panX, panY)
    domNode.style.left = `${domNode.node.x + frame.panX}px`;
    domNode.style.top = `${domNode.node.y + frame.panY}px`;
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
    const edgeStyle = getEdgeStyle(domEdge.graph, edge.id);
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

  function makeDomEdge(frame, graph, edge) {
    const domEdge = document.createElement('div');
    domEdge.frame = frame;
    domEdge.graph = graph;
    domEdge.edge = edge;
    domEdge.id = edge.id;
    if (edge.note) augmentDomEdgeNote(domEdge, edge.note);
    return domEdge;
  }

  function makeDomEdges(frame, graph) {
    for (let i = 0; i < graph.edges.length; i += 1) {
      const edge = graph.edges[i];
      const domEdge = makeDomEdge(frame, graph, edge);
      frame.insertBefore(domEdge, frame.firstChild);
      updateDomEdge(domEdge);
    }
  }

  function setGraph(frame, graph) {
    frame.innerHTML = '';
    frame.graph = graph;
    makeDomNodes(frame, graph);
    makeDomEdges(frame, graph);
  }

  function updateFrame(frame) {
    const domNodes = frame.querySelectorAll('.node');
    for (let i = 0; i < frame.graph.nodes.length; i += 1) {
      const node = frame.graph.nodes[i];
      let domNode = document.getElementById(node.id);
      if (domNode) {
        // update content of existing node
        updateDomNode(domNode);
      } else {
        // create new node that are in the graph
        domNode = makeDomNode(frame, frame.graph, node);
        frame.appendChild(domNode);
      }
    }
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
        domEdge = makeDomEdge(frame.graph, edge);
        frame.insertBefore(domEdge, frame.firstChild);
        updateDomEdge(domEdge);
      }
    }
    for (let i = 0; i < domEdges.length; i += 1) {
      const domEdge = domEdges[i];
      if (frame.graph.edges.includes(domEdge.edge) === false) { domEdge.remove(); }
    }
  }

  function initFrame(frame) {
    frame.panX = 0;
    frame.panY = 0;
    frame.selected = null;
    frame.dragBeginNode = null;
    frame.callbackNodeClicked = null;
    frame.callbackEdgeClicked = null;
    frame.callbackSelectionChanged = null;
    frame.addEventListener('mouseup', (event) => {
      const domNode = event.target.closest('.node');
      const domEdge = event.target.closest('.edge');
      if (event.shiftKey) {
        if (domNode && frame.dragBeginNode && frame.dragBeginNode !== domNode) {
          const downDomNode = frame.dragBeginNode;
          if (downDomNode) {
            let edge = findEdge(frame.graph, downDomNode.id, domNode.id);
            if (!edge) {
              edge = {
                id: `edge${frame.graph.edges.length}`,
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
      frame.dragBeginNode = event.target.closest('.node');
      if (frame.dragBeginNode && event.shiftKey) {
        const ghostEdge = document.createElement('div');
        ghostEdge.classList.add('hidden');
        ghostEdge.classList.add('ghost-edge');
        frame.insertBefore(ghostEdge, frame.firstChild);
      }
    });

    frame.addEventListener('mousemove', (event) => {
      if (event.buttons === 1) {
        const domNode = frame.dragBeginNode;
        if (frame.dragBeginNode) {
          // console.log(`move node ${domNode.node.id}`);
          if (!event.shiftKey) {
            domNode.node.x += event.movementX;
            domNode.node.y += event.movementY;
          } else {
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
          }
        } else {
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
        selectItem(frame, domNode);
        if (frame.callbackNodeDoubleClicked) frame.callbackNodeDoubleClicked(domNode);
        return;
      }

      const domEdge = event.target.closest('.edge');
      if (domEdge) {
        selectItem(frame, domEdge);
        if (frame.callbackEdgeDoubleClicked) frame.callbackEdgeDoubleClicked(domEdge);
        return;
      }

      frame.graph.nodes.push({
        id: `node${frame.graph.nodes.length}`,
        x: event.clientX - frame.getBoundingClientRect().left - frame.panX,
        y: event.clientY - frame.getBoundingClientRect().top - frame.panY,
      });
      updateFrame(frame);
    });
  }

  function setEdgeNote(domEdge, note) {
    const { edge } = domEdge;
    edge.note = note;
    updateDomEdge(domEdge);
  }

  function setNodeText(domNode, text) {
    let nodeData = getNodeData(domNode.graph, domNode.id);
    if (nodeData === undefined) nodeData = makeNodeData(domNode.graph, domNode.id);
    nodeData.text = text;
  }

  function setNodeImage(domNode, image) {
    const nodeData = getNodeData(domNode.graph, domNode.id);
    nodeData.image = image;
  }

  function playBlip() {
    document.querySelector('.blipg3').play();
  }

  function setEdgeWndTarget(domEdge) {
    document.querySelector('.edge-edit-wnd').target = domEdge;
  }

  function getEdgeWndTarget() {
    return document.querySelector('.edge-edit-wnd').target;
  }

  function updateEdgeWnd() {
    const formEdgeNote = document.querySelector('.form-edge-note');
    const domEdge = getEdgeWndTarget();
    const { note } = domEdge.edge;
    console.log('updateEdgeWnd', note);
    formEdgeNote.value = (note === undefined) ? '' : note;
  }

  function setNodeWndTarget(domNode) {
    document.querySelector('.node-edit-wnd').target = domNode;
  }

  function getNodeWndTarget() {
    return document.querySelector('.node-edit-wnd').target;
  }

  function updateNodeWnd(graph) {
    const domNode = getNodeWndTarget();
    const nodeData = getNodeData(graph, domNode.id);
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

  function onSelectionChanged(graph, domItem) {
    if (!domItem) {
      // * User Selected Empty Space
      // console.log('deselected');
      document.querySelector('.edge-edit-wnd').classList.add('hidden');
      document.querySelector('.node-edit-wnd').classList.add('hidden');
    } else if (domItem.classList.contains('node')) {
      // * User Selected Node
      // console.log(`node selected : ${domItem.id}`);
      setNodeWndTarget(domItem);
      updateNodeWnd(graph);
      document.querySelector('.edge-edit-wnd').classList.add('hidden');
      document.querySelector('.node-edit-wnd').classList.remove('hidden');
      playBlip();
    } else if (domItem.classList.contains('edge')) {
      // * User Selected Edge
      // console.log(`edge selected : ${domItem.id}`);
      setEdgeWndTarget(domItem);
      updateEdgeWnd();
      document.querySelector('.edge-edit-wnd').classList.remove('hidden');
      document.querySelector('.node-edit-wnd').classList.add('hidden');
      playBlip();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const frame = document.querySelector('.frame1');
    window.frame = frame;
    const elemEdgeEditWnd = document.querySelector('.edge-edit-wnd');
    elemEdgeEditWnd.addEventListener('keyup', (event) => {
      const domEdge = elemEdgeEditWnd.target;
      if (domEdge) {
        if (event.target === document.querySelector('.form-edge-note')) {
          console.log(event.target.value);
          setEdgeNote(domEdge, event.target.value);
          updateFrame(frame);
        }
      }
    });
    const elemNodeEditWnd = document.querySelector('.node-edit-wnd');
    elemNodeEditWnd.addEventListener('keyup', (event) => {
      const domNode = elemNodeEditWnd.target;
      if (domNode) {
        if (event.target === document.querySelector('.form-node-text')) {
          const nodeText = event.target.value;
          setNodeText(domNode, nodeText);
          updateFrame(frame);
        } else if (event.target === document.querySelector('.form-node-image')) {
          const nodeImgSrc = event.target.value;
          setNodeImage(domNode, nodeImgSrc);
          updateFrame(frame);
        }
      }
    });
    fetch('./example/basic.json')
      .then((response) => response.json())
      .then((graph) => {
        // initFrame must be called with frame element before any other calls
        initFrame(frame);
        setGraph(frame, graph);

        // optional. set callback function to be called when selection is changed.
        frame.callbackSelectionChanged = ((domItem) => {
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
        const fileInput = document.getElementById('file-input');
        document.querySelector('.btn-upload').addEventListener('click', () => {
          fileInput.click();
        });
        fileInput.addEventListener('change', (event) => {
          const file = fileInput.files[0];

          if (!file) {
            console.log('No file selected!');
            return;
          }

          const reader = new FileReader();

          reader.onload = (event) => {
            try {
              const parsed = JSON.parse(event.target.result);
              console.log(parsed);
              setGraph(frame, parsed);
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
