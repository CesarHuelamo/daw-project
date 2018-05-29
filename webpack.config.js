const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = [
	{
		name: 'app',
		entry: './index.js',
		output: {
			path: path.join(__dirname, 'public/js'),
			filename: 'bundle.js'
		},
		module: {
			rules: [
				{
					loader: 'babel-loader',
					test: /\.js$/,
					exclude: /node_modules/
				},
				{
					loader: 'css-loader',
					test: /\.css$/,
					exclude: /node_modules/
				}
			]
		}
	},
	{
		name: 'server',
		mode: 'production',
		entry: './server/server.js',
		output: {
			path: path.join(__dirname, 'server'),
			filename: 'app.js'
		},
		target: 'node',
		node: {
			__dirname: false
		},
		externals: [nodeExternals()],
		module: {
			rules: [
				{
					loader: 'babel-loader',
					test: /\.js$/,
					exclude: /node_modules/
				},
				{
					loader: 'css-loader',
					test: /\.css$/,
					exclude: /node_modules/
				}
			]
		}
	}
];
