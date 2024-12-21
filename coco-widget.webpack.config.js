const webpack = require("webpack")
const global = require("./global.webpack.config")
const SCW = require("slightning-coco-widget--webpack")

const { project } = require("./project")

module.exports = function (env, argv) {
    const globalConfig = global(env, argv)
    return {
        mode: globalConfig.mode,
        stats: globalConfig.stats,
        entry: globalConfig.entry({
            [project.name + "（编程猫 CoCo 控件版）" + ".js"]: "./src/wrapper/kitten-cloud-function-codemao-coco-widget.ts"
        }),
        output: globalConfig.output,
        optimization: globalConfig.optimization,
        module: {
            rules: [
                ...globalConfig.module.rules, ...SCW.loaders
            ]
        },
        resolve: {
            extensions: globalConfig.resolve.extensions
        },
        externalsType: SCW.externalsType,
        externals: SCW.externals,
        plugins: [
            ...SCW.plugins,
            ...globalConfig.plugins,
            new webpack.BannerPlugin({
                banner: [
                    "==CoCoWidget==",
                    "@name " + project.name,
                    "@author " + project.author,
                    "@version " + project.version,
                    "@license " + project.license,
                    "==/CoCoWidget=="
                ].map(line => `// ${line}\n`).join(""),
                raw: true,
                entryOnly: true
            })
        ]
    }
}
