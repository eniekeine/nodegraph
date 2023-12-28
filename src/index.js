import * as nodegraph from './nodegraph';

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
  formEdgeNote.innerHTML = domEdge.edge.note;
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

function onSelectionChanged(graph, domItem) {
  if (!domItem) {
    // if domItem is null, it means user deselected by clicking on empty space.
    // console.log('deselected');
    document.querySelector('.edge-edit-wnd').classList.add('hidden');
    document.querySelector('.node-edit-wnd').classList.add('hidden');
  } else if (domItem.classList.contains('node')) {
    // if domItem has 'node' class, user selected a node
    // console.log(`node selected : ${domItem.id}`);
    setNodeWndTarget(domItem);
    updateNodeWnd(graph);
    document.querySelector('.edge-edit-wnd').classList.add('hidden');
    document.querySelector('.node-edit-wnd').classList.remove('hidden');
    playBlip();
  } else if (domItem.classList.contains('edge')) {
    // if domItem has 'edge' class, user selected an edge
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
        setEdgeNote(domEdge, event.target.value);
      }
    }
  });
  const elemNodeEditWnd = document.querySelector('.node-edit-wnd');
  elemNodeEditWnd.addEventListener('keyup', (event) => {
    const domNode = elemNodeEditWnd.target;
    if (domNode) {
      if (event.target === document.querySelector('.form-node-text')) {
        nodegraph.setNodeText(domNode, event.target.value);
      } else if (event.target === document.querySelector('.form-node-image')) {
        nodegraph.setNodeImage(domNode, event.target.value);
      }
    }
  });
  fetch('/example/basic.json')
    .then((response) => response.json())
    .then((graph) => {
      // initFrame must be called with frame element before any other calls
      nodegraph.initFrame(frame);
      nodegraph.setGraph(frame, graph);

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

      document.querySelector('.btn-upload').addEventListener('click', () => {
        const fileInput = document.getElementById('file-input');
        fileInput.click();
        const file = fileInput.files[0];

        if (!file) {
          console.log('No file selected!');
          return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            nodegraph.setGraph(JSON.parse(event.target.result));
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
