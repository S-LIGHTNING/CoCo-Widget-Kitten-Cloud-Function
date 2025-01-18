const webpack = require("webpack")
const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = function (env, argv) {
    /** @type {webpack.Configuration["mode"]} */
    const mode = "production"
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
                // @ts-ignore
                if (mode == "production") {
                    newEntry[name.replace(/(?=\.[a-z]+$)/, ".min")] = entry[name]
                }
            }
            return newEntry
        },
        output: {
            path: path.resolve(__dirname, "dist", "web-packed"),
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
                    test: /\.tsx?$/,
                    use: "ts-loader"
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"]
        },
        /** @type {webpack.Configuration["externalsType"]} */
        externalsType: "var",
        externals: {},
        plugins: []
    }
    return config
}
