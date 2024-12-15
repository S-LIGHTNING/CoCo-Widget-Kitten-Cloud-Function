const webpack = require("webpack")
const global = require("./global.webpack.config")
const SCW = require("slightning-coco-widget--webpack")

// @ts-ignore
const { project } = require("./project")

module.exports = {
    mode: global.mode,
    stats: global.stats,
    entry: {
        [project.name + "（编程猫 CoCo 控件版）" + ".js"]: "./src/wrapper/kitten-cloud-function-codemao-coco-widget.ts",
        [project.name + "（编程猫 CoCo 控件版）" + ".min.js"]: "./src/wrapper/kitten-cloud-function-codemao-coco-widget.ts"
    },
    output: global.output,
    optimization: global.optimization,
    module: {
        rules: [
            ...global.module.rules, ...SCW.loaders
        ]
    },
    resolve: {
        extensions: global.resolve.extensions
    },
    externalsType: SCW.externalsType,
    externals: SCW.externals,
    plugins: [
        ...SCW.plugins,
        ...global.plugins,
        new webpack.BannerPlugin({
            banner: [
                "==CoCoWidget==",
                "@name " + project.name,
                "@author " + project.author,
                "@version " + project.version,
                "@license " + project.license,
                "@website https://s-lightning.github.io/",
                "==/CoCoWidget=="
            ].map(line => `// ${line}\n`).join(""),
            raw: true,
            test: /（编程猫 CoCo 控件版）(\.min)?\.js$/,
            entryOnly: true
        })
    ]
}
