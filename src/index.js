import * as nodegraph from './nodegraph';
import * as sidebar from './sidebar';
import model from './model';

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
  nodegraph.initFrame(model.frame);
  // optional. set callback function to be called when selection is changed.
  model.frame.callbackSelectionChanged = (domItem) => {
    onSelectionChanged(model.frame.graph, domItem);
  };
  // initialize DOM sidebar
  sidebar.initSidebar();
  // load basic.json graph file and display.
  fetch('./example/basic.json')
    .then((response) => response.json())
    .then((graph) => {
      nodegraph.setGraph(model.frame, graph);
    });
  // initialize DOM sidebar resizer
  initResizer();
});
