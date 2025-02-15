const webpack = require("webpack")
const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")

module.exports = function (env, argv) {
    /** @type {webpack.Configuration["mode"]} */
    const mode = env.develop ? "development" : "production"
    const config = {
        mode: mode,
        /** @type {webpack.Configuration["stats"]} */
        stats: "minimal",
        /**
         * @param {{ [x: string]: string }} entry
         * @returns {{ [x: string]: string }}
         */
        entry(entry) {
            /** @type {{ [x: string]: string }} */
            const newEntry = {}
            for (const name in entry) {
                newEntry[name] = entry[name]
                if (mode == "production") {
                    newEntry[name.replace(/(?=\.[a-z]+$)/, ".min")] = entry[name]
                }
            }
            return newEntry
        },
        output: {
            path: path.resolve(__dirname, mode == "development" ? "out" : "dist"),
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
                            // @ts-ignore
                            comments: new Function(
                                "node", "comment",
                                `return ${JSON.stringify(env.comments)}.filter(item => comment.value.includes(item)).length != 0`
                            )
                        }
                    },
                    extractComments: false
                })
            ]
        },
        module: {
            rules: [
                {
                    test: /\.(t|j)sx?$/,
                    exclude: /node_modules/,
                    use: "babel-loader"
                }, {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true
                        }
                    }
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"]
        },
        /** @type {webpack.Configuration["externalsType"]} */
        externalsType: "var",
        externals: {
            "axios": "axios",
            "diff": "diff",
            "crypto-js": "crypto"
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin(),
            new webpack.IgnorePlugin({
                resourceRegExp: /^(fs|os|path|websocket|appdirsjs)$/
            }),
            new webpack.DefinePlugin({
                global: "void 0"
            })
        ]
    }
    return config
}
