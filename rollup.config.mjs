export default [
  {
    input: 'src/nodegraph.js',
    output:
      {
        file: 'dist/nodegraph.bundle.cjs.js',
        format: 'cjs',
      },
  },
  {
    input: 'src/nodegraph.js',
    output: [
      {
        file: 'dist/nodegraph.bundle.es.js',
        format: 'es',
      },
    ],
  },
  {
    input: 'src/nodegraph.js',
    output:
      {
        file: 'dist/nodegraph.bundle.iife.js',
        format: 'iife',
        name: 'nodegraph',
      },
  },
  {
    input: 'src/nodegraph.js',
    output:
      {
        file: 'dist/nodegraph.bundle.umd.js',
        format: 'umd',
        name: 'nodegraph',
      },
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'iife',
    },
  },
];
