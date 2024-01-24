(function () {
  'use strict';

  function tellQuadrant(l, t, r, b, x, y) {
    const cx = (l + r) / 2;
    const cy = (t + b) / 2;
    const dl = l - cx;
    const dr = r - cx;
    const dt = t - cy;
    const db = b - cy;
    const dx = x - cx;
    const dy = y - cy;
    const a0 = Math.atan2(dt, dl);
    const a1 = Math.atan2(dt, dr);
    const a2 = Math.atan2(db, dr);
    const a3 = Math.atan2(db, dl);
    const a = Math.atan2(dy, dx);
    // top quadrent
    if (a0 <= a && a < a1) {
      // console.log('1');
      return 1;
    }
    // right quadrent
    if (a1 <= a && a < a2) {
      // console.log('2');
      return 2;
    }
    // bottom quadrent
    if (a2 <= a && a < a3) {
      // console.log('3');
      return 3;
    }
    // left quadrent
    // console.log('4');
    return 4;
  }

  function boxIntersect(l, t, r, b, x, y) {
    // console.log('boxIntersect');
    const cx = (l + r) / 2;
    const cy = (t + b) / 2;
    const dl = l - cx;
    const dr = r - cx;
    const dt = t - cy;
    const db = b - cy;
    const dx = x - cx;
    const dy = y - cy;
    const quadrant = tellQuadrant(l, t, r, b, x, y);
    switch (quadrant) {
      case 1:
      {
        const p = dt / dy;
        const ix = cx + dx * p;
        const coord = [ix, t];
        return coord;
      }
      case 2:
      {
        const p = dr / dx;
        const iy = cy + dy * p;
        const coord = [r, iy];
        return coord;
      }
      case 3:
      {
        const p = db / dy;
        const ix = cx + dx * p;
        const coord = [ix, b];
        return coord;
      }
      case 4:
      {
        const p = dl / dx;
        const iy = cy + dy * p;
        const coord = [l, iy];
        return coord;
      }
      default:
        console.error('boxIntersect: invalid quadrant');
    }
    throw new Error('boxINtersect: invalid quadrant');
  }

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
    const nodeData = { nodeid };
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

  // function addTestPoint(frame, x, y) {
  //   const test = document.createElement('div');
  //   test.style.position = 'absolute';
  //   test.style.left = `${x}px`;
  //   test.style.top = `${y}px`;
  //   test.style.backgroundColor = 'red';
  //   test.style.width = '10px';
  //   test.style.height = '10px';
  //   frame.appendChild(test);
  // }

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

  function getDomNodeCenterPosition(domNode) {
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

  function getDomNodeRect(domNode) {
    const parentRect = domNode.parentElement.getBoundingClientRect();
    const rect = domNode.getBoundingClientRect();
    return new DOMRect(
      rect.left - parentRect.left,
      rect.top - parentRect.top,
      rect.width,
      rect.height,
    );
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

  function getNodePosition(frame, nodeid) {
    const node = frame.querySelector(`#${nodeid}`);
    return getDomNodeCenterPosition(node);
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

  function updateDomEdge(frame, domEdge) {
    const { edge, style } = domEdge;
    const pos0 = getNodePosition(frame, edge.fromto[0]);
    const pos1 = getNodePosition(frame, edge.fromto[1]);
    const domNode0 = frame.querySelector(`#${edge.fromto[0]}`);
    const domNode1 = frame.querySelector(`#${edge.fromto[1]}`);
    const rect0 = getDomNodeRect(domNode0);
    const rect1 = getDomNodeRect(domNode1);
    const A = boxIntersect(
      rect0.left,
      rect0.top,
      rect0.right,
      rect0.bottom,
      pos1.x,
      pos1.y,
    );
    const B = boxIntersect(
      rect1.left,
      rect1.top,
      rect1.right,
      rect1.bottom,
      pos0.x,
      pos0.y,
    );
    const dx = B[0] - A[0];
    const dy = B[1] - A[1];
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
    style.left = `${A[0]}px`;
    style.top = `${A[1]}px`;
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
    const edgeTip = document.createElement('div');
    edgeTip.classList.add('edge-tip-triangle');
    domEdge.appendChild(edgeTip);
    return domEdge;
  }

  function makeDomEdges(frame, graph) {
    for (let i = 0; i < graph.edges.length; i += 1) {
      const edge = graph.edges[i];
      const domEdge = makeDomEdge(frame, edge);
      frame.insertBefore(domEdge, frame.firstChild);
      updateDomEdge(frame, domEdge);
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
    const promises = [];
    for (let i = 0; i < frame.graph.nodes.length; i += 1) {
      const node = frame.graph.nodes[i];
      const domNode = frame.querySelector(`#${node.id}`);
      if (domNode) {
        // update position of existing node
        updateDomNode(domNode, true, false);
      } else {
        // create new node that are in the graph
        promises.push(makeDomNode(frame, node).then((newDomNode) => {
          frame.appendChild(newDomNode);
        }));
      }
    }
    await Promise.all(promises);
    // update content of the existing nodes
    state.nodeNeedContentUpdate.forEach((domNode) => {
      updateDomNode(domNode, false, true);
    });
    // clear the update list
    state.nodeNeedContentUpdate = [];
    // delete nodes that are not in the graph
    for (let i = 0; i < domNodes.length; i += 1) {
      const domNode = domNodes[i];
      if (frame.graph.nodes.includes(domNode.node) === false) { domNode.remove(); }
    }
    const domEdges = frame.querySelectorAll('.edge');
    for (let i = 0; i < frame.graph.edges.length; i += 1) {
      const edge = frame.graph.edges[i];
      let domEdge = frame.querySelector(`#${edge.id}`);
      if (domEdge) {
        updateDomEdge(frame, domEdge);
      } else {
        domEdge = makeDomEdge(frame, edge);
        frame.insertBefore(domEdge, frame.firstChild);
        updateDomEdge(frame, domEdge);
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

  function checkDragMove(frame) {
    if (!frame.dragBeginNode) return false;
    if (!frame.mousedownTarget) return false;
    if (frame.mousedownTarget.classList.contains('node-content-container')) return true;
    if (frame.mousedownTarget === frame.dragBeginNode) return true;
    return false;
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

    frame.addEventListener('keyup', (event) => {
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
        if (checkDragMove(frame)) {
          // console.log(`move node ${domNode.node.id}`);
          if (event.shiftKey) {
            const downDomNode = frame.dragBeginNode.closest('.node');
            if (downDomNode) {
              const frameRect = frame.getBoundingClientRect();
              const ghostEdge = frame.querySelector('.ghost-edge');
              const pos0 = getDomNodeCenterPosition(downDomNode);
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
          event.preventDefault();
        }
        updateFrame(frame);
      }
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

  function setEdgeNote(frame, domEdge, note) {
    const { edge } = domEdge;
    edge.note = note;
    updateDomEdge(frame, domEdge);
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

  function download(graph) {
    const content = JSON.stringify(graph, null, 2);
    const a = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = 'graph.json';
    a.click();
  }

  async function upload(dstFrame, file) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    setGraph(dstFrame, parsed);
  }

  const model = {
    frame: null,
  };

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
    const nodeData = getNodeData(graph, domNode.id);
    const formNodeNote = document.querySelector('.form-node-text');
    const formNodeImage = document.querySelector('.form-node-image');
    const formNodeMarkdown = document.querySelector('.form-node-markdown');
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
    if (nodeData && nodeData.markdown) {
      formNodeMarkdown.value = nodeData.markdown;
    } else {
      formNodeMarkdown.value = '';
    }
  }

  function initSidebar() {
    const elemEdgeEditWnd = document.querySelector('.edge-edit-wnd');
    elemEdgeEditWnd.addEventListener('keyup', (event) => {
      const domEdge = elemEdgeEditWnd.target;
      if (domEdge) {
        if (event.target === document.querySelector('.form-edge-note')) {
          // console.log(event.target.value);
          setEdgeNote(model.frame, domEdge, event.target.value);
          updateFrame(model.frame);
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
          updateFrame(model.frame);
        } else if (event.target === document.querySelector('.form-node-image')) {
          const nodeImgSrc = event.target.value;
          setNodeImage(domNode, nodeImgSrc);
          updateFrame(model.frame);
        } else if (event.target === document.querySelector('.form-node-markdown')) {
          const nodeMarkdwon = event.target.value;
          setNodeMarkDown(domNode, nodeMarkdwon);
          updateFrame(model.frame);
        }
      }
    });
    // * new button
    document.querySelector('.btn-new-graph').addEventListener('click', () => {
      if (window.confirm('Starting a new graph will remove the current graph. Are you sure?')) {
        setGraph(model.frame, newGraph());
        updateFrame(model.frame);
      }
    });
    // * download button
    document.querySelector('.btn-download').addEventListener('click', () => {
      download(model.frame.graph);
    });
    // * upload button
    const fileInput = document.getElementById('file-input');
    document.querySelector('.btn-upload').addEventListener('click', () => {
      fileInput.click();
    });
    // * hidden file upload form element
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      upload(model.frame, file);
    });
  }

  function playBlip() {
    document.querySelector('.blipg3').play();
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

  function initResizer() {
    const resizer = document.querySelector('.right-sidebar-resizer');
    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const startX = e.clientX;
      // console.log('startX', startX);
      const sidebarWidth = document.querySelector('.right-sidebar').offsetWidth;
      // console.log('sidebarWidth', sidebarWidth);
      const mouseMoveHandler = (e2) => {
        e2.preventDefault();
        const delta = e2.clientX - startX;
        const newSidebarWidth = sidebarWidth - delta * 3;
        // console.log('delta', delta);
        if (newSidebarWidth >= 0) {
          document.querySelector('.right-sidebar').style.width = `${newSidebarWidth}px`;
        }
      };
      const mouseUpHandler = (e2) => {
        e2.preventDefault();
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // expose global reference for debugging
    window.model = model;
    // set model.frame as frame DOM element
    model.frame = document.querySelector('.frame1');
    // initFrame must be called with frame element before any other calls
    initFrame(model.frame);
    // optional. set callback function to be called when selection is changed.
    model.frame.callbackSelectionChanged = (domItem) => {
      onSelectionChanged(model.frame.graph, domItem);
    };
    // initialize DOM sidebar
    initSidebar();
    // load basic.json graph file and display.
    fetch('./example/basic.json')
      .then((response) => response.json())
      .then((graph) => {
        setGraph(model.frame, graph);
      });
    // initialize DOM sidebar resizer
    initResizer();
  });

})();
