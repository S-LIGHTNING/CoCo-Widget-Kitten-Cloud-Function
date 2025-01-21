const webpack = require("webpack")
const global = require("./global.webpack.config")
const SCW = require("slightning-coco-widget--webpack")

const { project } = require("./project")

SCW.addExternalImport({
    name: "axios",
    source: "https://cdn.jsdelivr.net/npm/axios@^1.7.9/dist/axios.min.js"
})

SCW.addExternalImport({
    name: "diff",
    source: "https://cdn.jsdelivr.net/npm/diff@^5.2.0/dist/diff.min.js"
})

SCW.addExternalImport({
    name: "crypto-js",
    source: "crypto-js",
    importer: SCW.importFromCoCo
})

/**
 * @returns {webpack.Configuration}
 */
module.exports = function (env, argv) {
    const comments = [
        "==CoCoWidget==",
        "@name " + project.name,
        "@author " + project.author,
        "@version " + project.version,
        "@license " + project.license,
        "==/CoCoWidget=="
    ]
    const globalConfig = global({
        ...env,
        comments: [
            ...comments,
            "This CoCo Widget uses SLIGHTNING CoCo Widget Framework."
        ]
    }, argv)
    return {
        mode: globalConfig.mode,
        stats: globalConfig.stats,
        entry: globalConfig.entry({
            [project.name + "（编程猫 CoCo 控件版）" + (env.noModificationRestriction ? "" : "（修改受限版）") + ".js"]: "./src/wrapper/kitten-cloud-function-codemao-coco-widget.ts"
        }),
        output: globalConfig.output,
        optimization: globalConfig.optimization,
        module: {
            rules: [
                ...SCW.loaders,
                ...globalConfig.module.rules
            ]
        },
        resolve: {
            extensions: globalConfig.resolve.extensions
        },
        externalsType: SCW.externalsType,
        externals: {
            ...globalConfig.externals,
            ...SCW.externals
        },
        plugins: [
            ...globalConfig.plugins,
            ...SCW.plugins,
            new webpack.BannerPlugin({
                banner: comments.map(line => `// ${line}\n`).join(""),
                raw: true,
                entryOnly: true
            }),
            new webpack.DefinePlugin({
                "KITTEN_CLOUD_FUNCTION_MODIFICATION_RESTRICTED": !env.noModificationRestriction
            })
        ]
    }
}
