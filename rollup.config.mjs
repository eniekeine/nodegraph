export default [
  {
    input: 'src/index.js', // Replace with your entry file
    output: {
      file: 'dist/index.js', // Replace with your desired output file and path
      format: 'iife', // Output format (Immediately Invoked Function Expression)
    },
  },
  {
    input: 'src/nodegraph.js',
    output: [
      {
        file: 'dist/nodegraph.bundle.cjs.js',
        format: 'cjs',
      },
    ],
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
];
