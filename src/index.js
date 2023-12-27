import * as nodegraph from './nodegraph';

document.addEventListener('DOMContentLoaded', () => {
  const frame = document.querySelector('.frame');
  fetch('/example/basic.json')
    .then((response) => response.json())
    .then((graphObject) => {
      nodegraph.domgraph.initFrame(frame, graphObject);
      nodegraph.domgraph.setSoundBlipUrl('/sound/blip_g3.wav');
      nodegraph.domgraph.setCallbackSelected((domItem) => {
        if (!domItem) {
          const nodeDataText = document.querySelector('.node-data-text');
          nodeDataText.value = '';
        } else if (domItem.classList.contains('node')) {
          const nodeDataText = document.querySelector('.node-data-text');
          const nodedata = nodegraph.graphview.getNodeData(graphObject, domItem.id);
          if (nodedata) {
          // ※ (null, 2) means pretty-print with 2-space indent
            nodeDataText.value = JSON.stringify(nodedata, null, 2);
          } else {
            nodeDataText.value = '';
          }
        } else if (domItem.classList.contains('edge')) {
          console.log(`edge selected : ${domItem.id}`);
        }
      });
    });
});
