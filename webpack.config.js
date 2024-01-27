const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js',
  },
  // Define the rules for how to process different module types.
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  // Add and configure plugins
  plugins: [
    new MiniCssExtractPlugin({
      // Output file
      filename: 'css/index.min.css',
    }),
  ],
  // Optimization configuration
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },

};
