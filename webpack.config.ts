// https://code.visualstudio.com/api/extension-guides/web-extensions
export default {
	mode: "none",
	target: "webworker",
	entry: {
		extension: "./src/extension.ts"
	},
	output: {
		filename: "[name].js",
		libraryTarget: "commonjs"
	},
	resolve: {
		mainFields: ["browser", "module", "main"],
		extensions: [".ts", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.ts/,
				use: "ts-loader"
			}
		]
	},
	externals: {
		vscode: "commonjs vscode"
	}
}