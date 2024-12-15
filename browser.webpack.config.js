const global = require("./global.webpack.config")

// @ts-ignore
const { project } = require("./project")

module.exports = {
    mode: global.mode,
    stats: global.stats,
    entry: {
        [project.title + "-browser" + ".js"]: "./src/wrapper/kitten-cloud-function-browser.ts",
        [project.title + "-browser" + ".min.js"]: "./src/wrapper/kitten-cloud-function-browser.ts"
    },
    output: global.output,
    optimization: global.optimization,
    module: {
        rules: [
            ...global.module.rules
        ]
    },
    resolve: {
        extensions: global.resolve.extensions
    },
    externalsType: global.externalsType,
    externals: global.externals,
    plugins: [
        ...global.plugins
    ]
}
