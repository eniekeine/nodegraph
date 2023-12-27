import {
  initFrame, setCallbackNodeClicked, setSoundBlipUrl,
} from './domgraph';
import graph from './graph';
import { getNodeData } from './graphview';

document.addEventListener('DOMContentLoaded', () => {
  const frame = document.querySelector('.frame');
  initFrame(frame, graph);
  setSoundBlipUrl('/sound/blip_g3.wav');
  setCallbackNodeClicked((node) => {
    const nodedata = getNodeData(graph, node.id);
    console.log(`Clicked node: ${node.id}`);
    const nodeDataText = document.querySelector('.node-data-text');
    if (nodedata) {
      // ※ (null, 2) means pretty-print with 2-space indent
      nodeDataText.value = JSON.stringify(nodedata, null, 2);
    } else {
      nodeDataText.value = '';
    }
  });
});
