import * as nodegraph from './nodegraph';

function playBlip() {
  document.querySelector('.blipg3').play();
}

function onSelectionChanged(graph, domItem) {
  if (!domItem) {
    console.log('deselected');
    // if domItem is null, it means user deselected by clicking on empty space.
    const nodeDataText = document.querySelector('.node-data-text');
    nodeDataText.value = '';
  } else if (domItem.classList.contains('node')) {
    console.log(`node selected : ${domItem.id}`);
    // if domItem has 'node' class, user selected a node
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
    // if domItem has 'edge' class, user selected an edge
    console.log(`edge selected : ${domItem.id}`);
    playBlip();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const frame = document.querySelector('.frame');
  fetch('https://github.com/eniekeine/nodegraph/blob/master/example/basic.json')
    .then((response) => response.json())
    .then((graph) => {
      // initFrame must be called with frame element before any other calls
      nodegraph.domgraph.initFrame(frame, graph);

      // optional. set callback function to be called when selection is changed.
      nodegraph.domgraph.setCallbackSelectionChanged((domItem) => {
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
        const file = fileInput.files[0];

        if (!file) {
          // console.log('No file selected!');
          return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            nodegraph.domgraph.setGraph(JSON.parse(event.target.result));
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
