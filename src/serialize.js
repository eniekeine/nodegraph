import * as nodegraph from './nodegraph';

function download(graph) {
  const content = JSON.stringify(graph, null, 2);
  const a = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  a.href = URL.createObjectURL(file);
  a.download = 'graph.json';
  a.click();
}

async function upload(dstFrame, file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  nodegraph.setGraph(dstFrame, parsed);
}

export {
  download,
  upload,
};
