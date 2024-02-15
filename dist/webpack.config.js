"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const dotenv_1 = __importDefault(require("dotenv"));
const clean_webpack_plugin_1 = require("clean-webpack-plugin");
const configuration = {
    mode: 'development',
    entry: './index.ts',
    output: {
        filename: 'index.js',
        path: path_1.default.resolve(__dirname, 'dist'),
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
        new clean_webpack_plugin_1.CleanWebpackPlugin(),
        dotenv_1.default.config(),
        new webpack_1.default.DefinePlugin({
            'process.env': JSON.stringify(process.env),
        }),
    ],
};
exports.default = configuration;
//# sourceMappingURL=webpack.config.js.map