const graph = {
  nodes: [
    { id: 'n1', x: 100, y: 100 },
    { id: 'n2', x: 500, y: 100 },
    {
      id: 'n3', x: 500, y: 300, w: 64, h: 100,
    },
    { id: 'n4', x: 600, y: 300 },
    { id: 'n5', x: 600, y: 400 },
  ],
  edges: [
    { id: 'e1', fromto: ['n1', 'n2'] },
    { id: 'e2', fromto: ['n1', 'n3'] },
    { id: 'e3', fromto: ['n3', 'n4'] },
  ],
  nodeData: [
    { nodeid: 'n2', text: 'Node 2' },
    { nodeid: 'n3', image: '/image/graphicon/database-svgrepo-com.svg' },
    { nodeid: 'n4', html: '<div class="node-content-text">abcdefg</div>' },
  ],
  edgeStyles: [
    { edgeid: 'e2', class: 'edge-custom1' },
    { edgeid: 'e3', class: 'edge-custom2' },
  ],
};

export default graph;
