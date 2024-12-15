const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")
const UnminifiedWebpackPlugin = require("unminified-webpack-plugin")

module.exports = {
    mode: "development",
    stats: "minimal",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name]",
        environment: {
            arrowFunction: false
        }
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                include: /\.min\./,
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
        // new UnminifiedWebpackPlugin()
    ]
}
