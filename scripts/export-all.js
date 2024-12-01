const fs = require("fs")

function print(base) {
    for (const name of fs.readdirSync(base)) {
        const path = base + "/" + name
        if (fs.lstatSync(path).isDirectory()) {
            print(path)
        } else {
            console.log("export * from \"" + path.split(".").slice(0, -1).join(".") + "\"")
        }
    }
}

print("./src")
