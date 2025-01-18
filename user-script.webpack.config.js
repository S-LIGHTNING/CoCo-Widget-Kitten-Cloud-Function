const webpack = require("webpack")
const global = require("./global.webpack.config")

const { project } = require("./project")

/**
 * @returns {webpack.Configuration}
 */
module.exports = function (env, argv) {
    const comments = [
        "==UserScript==",
        "@name 编程猫源码云数据编辑器",
        "@namespace https://s-lightning.github.io/",
        "@author " + project.author,
        "@version 1.0.0",
        "@description 基于源码云功能客户端编写的用户脚本，可以查看和修改编程猫已发布的源码作品的云变量和云列表",
        "@icon https://cdn-community.codemao.cn/community_frontend/asset/icon_kitten4_bd2e0.png",
        "@license " + project.license,
        "==/UserScript=="
    ]
    const globalConfig = global({ ...env, comments }, argv)
    return {
        mode: globalConfig.mode,
        stats: globalConfig.stats,
        entry: globalConfig.entry({
            [project.name + "（用户脚本版）" + ".js"]: "./src/wrapper/kitten-cloud-function-user-script.ts"
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
        plugins: [
            ...globalConfig.plugins,
            new webpack.BannerPlugin({
                banner: comments.map(line => `// ${line}\n`).join(""),
                raw: true,
                test: /（用户脚本版）\.js$/,
                entryOnly: true
            })
        ]
    }
}
