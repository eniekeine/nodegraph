import * as nodegraph from './nodegraph';
import * as sidebar from './sidebar';
import * as serialize from './serialize';

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
    sidebar.setNodeWndTarget(domItem);
    sidebar.updateNodeWnd(graph);
    document.querySelector('.edge-edit-wnd').classList.add('hidden');
    document.querySelector('.node-edit-wnd').classList.remove('hidden');
    playBlip();
  } else if (domItem.classList.contains('edge')) {
    // * User Selected Edge
    // console.log(`edge selected : ${domItem.id}`);
    sidebar.setEdgeWndTarget(domItem);
    sidebar.updateEdgeWnd();
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
        // console.log(event.target.value);
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
  fetch('./example/basic.json')
    .then((response) => response.json())
    .then((graph) => {
      // initFrame must be called with frame element before any other calls
      nodegraph.initFrame(frame);
      nodegraph.setGraph(frame, graph);
      // optional. set callback function to be called when selection is changed.
      frame.callbackSelectionChanged = ((domItem) => {
        onSelectionChanged(graph, domItem);
      });
      // * download button
      document.querySelector('.btn-download').addEventListener('click', () => {
        serialize.download(graph);
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
        serialize.upload(frame, file);
      });
    });
});
