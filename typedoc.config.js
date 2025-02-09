const path = require("path")

const { project } = require("./project")

module.exports = {
    name: `源码云功能 v${project.version} 文档`,
    entryPoints: [
        "src/**/*"
    ],
    out: path.resolve("docs", project.version),
    theme: "default",
    plugin: [
        "typedoc-plugin-mermaid",
        "typedoc-material-theme"
    ],
    excludePrivate: true,
    excludeProtected: true,
    excludeExternals: true,
    excludeNotDocumented: true,
    exclude: ["node_modules"],
    readme: "README.md"
}
