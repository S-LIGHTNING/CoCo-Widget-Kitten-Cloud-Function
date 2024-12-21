const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = function (env, argv) {
    const config = {
        mode: "development",
        stats: "minimal",
        /**
         * @param {{ [x: string]: string }} entry
         * @returns {{ [x: string]: string }}
         */
        entry(entry) {
            /** @type {{ [x: string]: string }} */
            const newEntry = {}
            for (const name in entry) {
                if (env.transform) {
                    if (config.mode == "production") {
                        newEntry[name.replace(/(?=\.[a-z]+$)/, ".transformed")] = entry[name]
                        newEntry[name.replace(/(?=\.[a-z]+$)/, ".transformed.min")] = entry[name]
                    }
                } else {
                    newEntry[name] = entry[name]
                    if (config.mode == "production") {
                        newEntry[name.replace(/(?=\.[a-z]+$)/, ".min")] = entry[name]
                    }
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
        plugins: []
    }
    if (env.transform) {
        config.module.rules.unshift({
            test: /\.(j|t)sx?$/,
            use: "babel-loader"
        })
    }
    return config
}
