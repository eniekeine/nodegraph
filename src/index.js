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
        nodegraph.setEdgeNote(domEdge, event.target.value);
        nodegraph.updateFrame(frame);
      }
    }
  });
  const elemNodeEditWnd = document.querySelector('.node-edit-wnd');
  elemNodeEditWnd.addEventListener('keyup', (event) => {
    const domNode = elemNodeEditWnd.target;
    if (domNode) {
      if (event.target === document.querySelector('.form-node-text')) {
        const nodeText = event.target.value;
        nodegraph.setNodeText(domNode, nodeText);
        nodegraph.updateFrame(frame);
      } else if (event.target === document.querySelector('.form-node-image')) {
        const nodeImgSrc = event.target.value;
        nodegraph.setNodeImage(domNode, nodeImgSrc);
        nodegraph.updateFrame(frame);
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
            nodegraph.setGraph(frame, parsed);
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
