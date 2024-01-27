export default [
  {
    input: 'src/js/nodegraph.js',
    output:
      {
        file: 'dist/js/nodegraph.bundle.cjs.js',
        format: 'cjs',
      },
  },
  {
    input: 'src/js/nodegraph.js',
    output: [
      {
        file: 'dist/js/nodegraph.bundle.es.js',
        format: 'es',
      },
    ],
  },
  {
    input: 'src/js/nodegraph.js',
    output:
      {
        file: 'dist/js/nodegraph.bundle.iife.js',
        format: 'iife',
        name: 'nodegraph',
      },
  },
  {
    input: 'src/js/nodegraph.js',
    output:
      {
        file: 'dist/js/nodegraph.bundle.umd.js',
        format: 'umd',
        name: 'nodegraph',
      },
  },
];
