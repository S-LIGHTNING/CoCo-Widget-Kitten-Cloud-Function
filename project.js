const packageInfo = require("./package.json")

exports.project = {
    title: packageInfo.name,
    name: "源码云功能",
    description: packageInfo.description,
    author: packageInfo.author,
	version: packageInfo.version,
    license: packageInfo.license,
    docs: "https://s-lightning.github.io/Kitten-Cloud-Function/" + packageInfo.version
}
