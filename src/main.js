import {
  initFrame, makeNodes, makeEdges, setFrameSize, setSoundBlipUrl,
} from './domgraph';

document.addEventListener('DOMContentLoaded', () => {
  const frame = document.querySelector('.frame');
  initFrame(frame);
  makeNodes();
  makeEdges();
  setFrameSize(1024, 768);
  setSoundBlipUrl('/sound/blip_g3.wav');
});
