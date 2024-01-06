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

document.addEventListener('DOMContentLoaded', () => {
  model.frame = document.querySelector('.frame1');
  // initFrame must be called with frame element before any other calls
  nodegraph.initFrame(model.frame);
  // optional. set callback function to be called when selection is changed.
  model.frame.callbackSelectionChanged = ((domItem) => {
    onSelectionChanged(model.frame.graph, domItem);
  });
  sidebar.initSidebar();
  fetch('./example/basic.json')
    .then((response) => response.json())
    .then((graph) => {
      nodegraph.setGraph(model.frame, graph);
    });
});
