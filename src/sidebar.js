import * as nodegraph from './nodegraph';
import * as serialize from './serialize';
import model from './model';

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
  const nodeData = nodegraph.getNodeData(graph, domNode.id);
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
        nodegraph.setEdgeNote(model.frame, domEdge, event.target.value);
        nodegraph.updateFrame(model.frame);
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
        nodegraph.updateFrame(model.frame);
      } else if (event.target === document.querySelector('.form-node-image')) {
        const nodeImgSrc = event.target.value;
        nodegraph.setNodeImage(domNode, nodeImgSrc);
        nodegraph.updateFrame(model.frame);
      } else if (event.target === document.querySelector('.form-node-markdown')) {
        const nodeMarkdwon = event.target.value;
        nodegraph.setNodeMarkDown(domNode, nodeMarkdwon);
        nodegraph.updateFrame(model.frame);
      }
    }
  });
  // * new button
  document.querySelector('.btn-new-graph').addEventListener('click', () => {
    if (confirm('Starting a new graph will remove the current graph. Are you sure?')) {
      nodegraph.setGraph(model.frame, nodegraph.newGraph());
      nodegraph.updateFrame(model.frame);
    }
  });
  // * download button
  document.querySelector('.btn-download').addEventListener('click', () => {
    serialize.download(model.frame.graph);
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
    serialize.upload(model.frame, file);
  });
}

export {
  getEdgeWndTarget,
  updateEdgeWnd,
  setEdgeWndTarget,
  setNodeWndTarget,
  getNodeWndTarget,
  updateNodeWnd,
  initSidebar,
};
