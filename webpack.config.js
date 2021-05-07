const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    bundle: './src/index.ts',
  },
  resolve: {
    extensions: ['.ts', 'tsx', '.js'],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    library: 'microcms',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
};
