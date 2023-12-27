import * as nodegraph from './nodegraph';

function playBlip() {
  document.querySelector('.blipg3').play();
}

document.addEventListener('DOMContentLoaded', () => {
  const frame = document.querySelector('.frame');
  fetch('/example/basic.json')
    .then((response) => response.json())
    .then((graph) => {
      // initFrame must be called with frame element before any other calls
      nodegraph.domgraph.initFrame(frame, graph);
      // setCallbackSelected is optional. set callback function to be called when node is selected.
      nodegraph.domgraph.setCallbackSelected((domItem) => {
        if (!domItem) {
          const nodeDataText = document.querySelector('.node-data-text');
          nodeDataText.value = '';
        } else if (domItem.classList.contains('node')) {
          const nodeDataText = document.querySelector('.node-data-text');
          const nodedata = nodegraph.graphview.getNodeData(graph, domItem.id);
          if (nodedata) {
          // ※ (null, 2) means pretty-print with 2-space indent
            nodeDataText.value = JSON.stringify(nodedata, null, 2);
          } else {
            nodeDataText.value = '';
          }
          playBlip();
        } else if (domItem.classList.contains('edge')) {
          console.log(`edge selected : ${domItem.id}`);
          playBlip();
        }
      });
    });
});
