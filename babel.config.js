module.exports = {
    presets: [
        ["@babel/preset-env", {
            targets: {
                chrome: "60",
                firefox: "55"
            }
        }]
    ],
    plugins: []
}
