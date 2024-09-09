const path = require("path");
const { ProvidePlugin, EnvironmentPlugin } = require("webpack");

module.exports = [
	{
		target: "browserslist",
		mode: "production",
		entry: "./src/background.ts",
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/,
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: [
								"@babel/preset-env",
								"@babel/preset-react",
							],
						},
					},
				},
			],
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
			fallback: {
				buffer: require.resolve("buffer"),
			},
		},
		output: {
			filename: "background.js",
			path: path.resolve(__dirname, "../build"),
		},
		plugins: [
			new ProvidePlugin({
				Buffer: ["buffer", "Buffer"],
				process: "process/browser",
			}),
			new EnvironmentPlugin([
				"REACT_APP_TONCENTER_API_KEY",
				"REACT_APP_TONCENTER_TESTNET_API_KEY",
			]),
		],
	},
	{
		target: "node",
		mode: "production",
		entry: "./src/provider.ts",
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/,
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: [
								"@babel/preset-env",
								"@babel/preset-react",
							],
						},
					},
				},
			],
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
		},
		output: {
			filename: "provider.js",
			path: path.resolve(__dirname, "../build"),
		},
	},
	{
		target: "node",
		mode: "production",
		entry: "./src/content.ts",
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/,
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: [
								"@babel/preset-env",
								"@babel/preset-react",
							],
						},
					},
				},
			],
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
		},
		output: {
			filename: "content.js",
			path: path.resolve(__dirname, "../build"),
		},
	},
];
