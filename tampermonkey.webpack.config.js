const webpack = require("webpack")
const global = require("./global.webpack.config")

const { project } = require("./project")

module.exports = function (env, argv) {
    const globalConfig = global(env, argv)
    return {
        mode: globalConfig.mode,
        stats: globalConfig.stats,
        entry: globalConfig.entry({
            [project.name + "（窜改猴用户脚本版）" + ".js"]: "./src/wrapper/kitten-cloud-function-tampermonkey-user-script.ts"
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
        externalsType: "var",
        externals: {
            "diff": "diff"
        },
        plugins: [
            ...globalConfig.plugins,
            new webpack.BannerPlugin({
                banner:[
                    "==UserScript==",
                    "@name 编程猫" + project.name,
                    "@namespace https://s-lightning.github.io/",
                    "@author " + project.author,
                    "@version " + project.version,
                    "@description 用于编程猫源码云功能（云变量、云列表等）的客户端库，包含查看和修改编程猫已发布的源码作品的云变量和云列表的功能",
                    "@icon https://cdn-community.codemao.cn/community_frontend/asset/icon_kitten4_bd2e0.png",
                    "@license " + project.license,
                    "@require https://cdn.jsdelivr.net/npm/diff@5.2.0/dist/diff.js",
                    "==/UserScript=="
                ].map(line => `// ${line}\n`).join(""),
                raw: true,
                test: /（窜改猴库版）\.js$/,
                entryOnly: true
            }),
            new webpack.BannerPlugin({
                banner:[
                    "==UserScript==",
                    "@name 编程猫源码云数据编辑器",
                    "@namespace https://s-lightning.github.io/",
                    "@author " + project.author,
                    "@version 1.0.0",
                    "@description 基于源码云功能客户端编写的用户脚本，可以查看和修改编程猫已发布的源码作品的云变量和云列表",
                    "@icon https://cdn-community.codemao.cn/community_frontend/asset/icon_kitten4_bd2e0.png",
                    "@license " + project.license,
                    "==/UserScript=="
                ].map(line => `// ${line}\n`).join(""),
                raw: true,
                test: /（窜改猴用户脚本版）\.js$/,
                entryOnly: true
            })
        ]
    }
}
