const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")
const UnminifiedWebpackPlugin = require("unminified-webpack-plugin")

module.exports = {
    mode: "production",
    stats: "minimal",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].min.js",
        environment: {
            arrowFunction: false
        }
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false
                    }
                },
                extractComments: false
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                use: "babel-loader"
            }, {
                test: /\.tsx?$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    externalsType: "var",
    externals: {},
    plugins: [
        new UnminifiedWebpackPlugin()
    ]
}
