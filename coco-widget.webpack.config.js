const webpack = require("webpack")
const path = require("path")
const global = require("./global.webpack.config")
const SCW = require("slightning-coco-widget--webpack")

const { project } = require("./project")

SCW.addExternalImport({
    name: "axios",
    source: "https://cdn.jsdelivr.net/npm/axios@1/dist/axios.min.js"
})

SCW.addExternalImport({
    name: "diff",
    source: "https://cdn.jsdelivr.net/npm/diff@5/dist/diff.min.js"
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
    let editionName, isExclusiveEdition = false
    if (env.develop) {
        editionName = "（开发调试版）"
    } else if (
        typeof env.user == "string" &&
        typeof env.usingWork == "string" &&
        typeof env.connectingWork == "string"
    ) {
        isExclusiveEdition = true
        editionName = `（用户 ${env.user} 在 ${env.usingWork} 中连接 ${env.connectingWork} 的专用版）`
    } else {
        editionName = "（修改受限版）"
    }
    const comments = [
        "==CoCoWidget==",
        "@name " + project.name + editionName,
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
    const config = {
        mode: globalConfig.mode,
        stats: globalConfig.stats,
        entry: {
            [project.name + "（编程猫 CoCo 控件版）" + editionName + ".min.js"]: "./src/wrapper/kitten-cloud-function-codemao-coco-widget.ts"
        },
        output: {
            ...globalConfig.output,
            path: globalConfig.mode == "development" ? path.resolve(__dirname, "out", "dev") : path.resolve(__dirname, "out")
        },
        optimization: globalConfig.optimization,
        module: {
            rules: [
                ...SCW.loaders,
                {
                    test: /kitten-cloud-function-codemao-coco-widget\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                ["@babel/preset-env", {
                                    targets: {
                                        ie: "11"
                                    }
                                }]
                            ],
                            plugins: []
                        }
                    }
                }, ...globalConfig.module.rules
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
                "KITTEN_CLOUD_FUNCTION_DEVELOP": JSON.stringify(env.develop ?? false),
                "KITTEN_CLOUD_FUNCTION_ALLOW": isExclusiveEdition ? JSON.stringify({
                    USER: env.user,
                    USING_WORK: env.usingWork,
                    CONNECTING_WORK: env.connectingWork,
                }) : "(void 0)"
            })
        ]
    }
    return config
}
