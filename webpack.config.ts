import path from 'path';
import webpack from 'webpack';
import dotenv from 'dotenv';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';

const configuration =  {
  mode: 'development',
  entry: './index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  experiments: {
    outputModule: true,
},
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    dotenv.config(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
};
export default configuration;