const nodedata = [
  {
    nodeid: 1,
    title: 'Hello, World',
    desc: '최초의 HTML 페이지를 만들어 봅니다.',
    nodeText: '1',
  },
];

function getNodeData(nodeid) {
  return nodedata.find((node) => node.nodeid === nodeid);
}

export {
  nodedata,
  getNodeData,
};
