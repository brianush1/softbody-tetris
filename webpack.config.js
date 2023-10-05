const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
	target: "web",
	// devtool: "inline-source-map",
	entry: {
		"bundle": "./src/index.ts",
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin({
			terserOptions: {
				compress: true,
			},
			minify: (file, sourceMap, minimizerOptions) => {
				const extractedComments = [];
				const { map, code } = require("uglify-js").minify(file, {
					mangle: {
						toplevel: true,
					},
				});
				return { map, code, extractedComments };
			},
		})],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "public"),
	},
	devServer: {
		static: {
			directory: path.resolve(__dirname, "public"),
			watch: {
				ignored: /node_modules/,
				usePolling: true,
				poll: 100,
			},
		},
	},
	mode: "production",
};
