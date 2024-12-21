const webpack = require("webpack")
const global = require("./global.webpack.config")

const { project } = require("./project")

module.exports = function (env, argv) {
    const globalConfig = global(env, argv)
    return {
        mode: globalConfig.mode,
        stats: globalConfig.stats,
        entry: globalConfig.entry({
            [project.title + "-browser" + ".js"]: "./src/wrapper/kitten-cloud-function-browser.ts"
        }),
        output: globalConfig.output,
        optimization: globalConfig.optimization,
        module: {
            rules: [
                ...globalConfig.module.rules
            ]
        },
        resolve: {
            extensions: globalConfig.resolve.extensions
        },
        externalsType: globalConfig.externalsType,
        externals: globalConfig.externals,
        plugins: [
            ...globalConfig.plugins,
            new webpack.BannerPlugin({
                banner: "/**" + "\n" + [
                    "@name " + project.name,
                    "@author " + project.author,
                    "@version " + project.version,
                    "@license " + project.license
                ].map(line => ` * ${line}\n`).join("") + " */" + "\n",
                raw: true,
                entryOnly: true
            })
        ]
    }
}
