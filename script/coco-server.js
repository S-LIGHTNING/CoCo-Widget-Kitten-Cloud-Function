// ==UserScript==
// @name         CoCo 编程猫环境服务
// @namespace    https://s-lightning.github.io/
// @version      0.0.0
// @description  CoCo 编程猫环境服务，为非编程猫网站提供编程猫服务的环境
// @author       SLIGHTNING
// @match        http://*.codemao.cn/*
// @match        https://*.codemao.cn/*
// @icon         https://coco.codemao.cn/favicon.ico
// @grant        none
// @license      AGPL-3.0
// ==/UserScript==

(function () {
    let originalFetch = fetch
    /**
     * @param input {string | URL | Request}
     * @param init {RequestInit | undefined}
     * @returns {Promise<Response>}
     */
    // @ts-ignore
    fetch = async function(input, init) {
        let response = await originalFetch(input, init)
        if (input == "https://static.codemao.cn/coco/whitelist.json") {
            try {
                let stringWorkID = new URLSearchParams(location.search).get("workId")
                if (stringWorkID == null) {
                    throw new Error("获取作品 ID 失败，可能因为作品未保存到云端，请将作品保存到云端后再尝试。")
                }
                let workID = Number(stringWorkID)
                if (workID == 0 || isNaN(workID)) {
                    throw new Error("获取作品 ID 失败，可能因为作品未保存到云端，请将作品保存到云端后再尝试。")
                }
                let whiteList /** @type {number[]} */ = await response.json()
                whiteList.push(workID)
                return new Response(JSON.stringify(whiteList), {
                    ...response
                })
            } catch (error) {
                console.error(error)
                return response
            }
        }
        return response
    }

    function modifyReleaseFile(file) {
        addExtension(file)
    }

    function addExtension(file) {
        file.unsafeExtensionWidgetList.unshift({
            code: `
                new Function(\`(\${${(function CoCoCodemaoEnvironmentServer() {
                    // @ts-ignore
                    if (window.COCO_CODEMAO_ENVIRONMENT_SERVER) {
                        return
                    }
                    // @ts-ignore
                    window.COCO_CODEMAO_ENVIRONMENT_SERVER = true
                    if (location.pathname == "/editor/") {
                        const scriptElement = document.createElement("script")
                        scriptElement.innerHTML = `(${CoCoCodemaoEnvironmentServer.toString()})()`
                        parent.document.body.appendChild(scriptElement)
                        return
                    }

                    const hintElement = document.createElement("div")
                    hintElement.innerText = "编程猫环境服务\n请不要关闭该界面！\n你现在可以返回来时的界面了（不要关闭该界面！）"
                    hintElement.style.width = "100%"
                    hintElement.style.height = "100%"
                    hintElement.style.fontSize = "2em"
                    hintElement.style.position = "fixed"
                    hintElement.style.left = "0px"
                    hintElement.style.top = "0px"
                    hintElement.style.right = "0px"
                    hintElement.style.bottom = "0px"
                    hintElement.style.backgroundColor = "white"
                    hintElement.style.zIndex = "10000"
                    document.body.appendChild(hintElement)

                    function copy(data) {
                        if (
                            data == null ||
                            typeof data == "string" ||
                            typeof data == "number" ||
                            typeof data == "boolean"
                        ) {
                            return data
                        }
                        if (Array.isArray(data)) {
                            return data.map(copy)
                        } else if (typeof data == "object") {
                            let result = {}
                            for (const key of Object.getOwnPropertyNames(data)) {
                                result[key] = copy(data[key])
                            }
                            return result
                        } else {
                            return String(data)
                        }
                    }

                    function postMessageToOpener(data) {
                        try {
                            data = copy(data)
                            if (opener == null) {
                                parent.postMessage(data, "*")
                            } else {
                                opener.postMessage(data, "*")
                            }
                        } catch (error) {
                            alert(error.stack)
                        }
                    }

                    let axios, getAxios
                    let webSocketRecord = {}
                    window.addEventListener("message", (event) => {
                        const { data } = event
                        if (data == null || typeof data != "object") {
                            return
                        }
                        switch (data.type) {
                            case "CODEMAO_ENVIRONMENT_LOGIN":
                                location.replace("https://shequ.codemao.cn/mobile/login")
                                break
                            case "CODEMAO_ENVIRONMENT_AXIOS":
                                (async () => {
                                    try {
                                        if (axios == undefined) {
                                            if (getAxios == undefined) {
                                                getAxios = (async () => {
                                                    const code = await (await fetch("https://cdn.jsdelivr.net/npm/axios@1/dist/axios.min.js")).text()
                                                    const exports = {}, module = { exports }
                                                    new Function("module", "exports", code)(module, exports)
                                                    axios = module.exports
                                                })()
                                            }
                                            await getAxios
                                        }
                                        axios(data.argument).then((response) => {
                                            postMessageToOpener({
                                                type: "CODEMAO_ENVIRONMENT_AXIOS_RESULT",
                                                id: data.id,
                                                success: true,
                                                response: response
                                            })
                                        }).catch((error) => {
                                            postMessageToOpener({
                                                type: "CODEMAO_ENVIRONMENT_AXIOS_RESULT",
                                                id: data.id,
                                                success: false,
                                                error: error
                                            })
                                        })
                                    } catch (error) {
                                        postMessageToOpener({
                                            type: "CODEMAO_ENVIRONMENT_AXIOS_RESULT",
                                            id: data.id,
                                            success: false,
                                            response: error
                                        })
                                    }
                                })()
                                break
                            case "CODEMAO_ENVIRONMENT_WEB_SOCKET":
                                let webSocket
                                try {
                                    webSocket = new WebSocket(data.url)
                                } catch (error) {
                                    postMessageToOpener({
                                        type: "CODEMAO_ENVIRONMENT_WEB_SOCKET_ERROR",
                                        id: data.id,
                                        error: error
                                    })
                                    return
                                }
                                webSocket.addEventListener("open", (event) => {
                                    postMessageToOpener({
                                        type: "CODEMAO_ENVIRONMENT_WEB_SOCKET_OPEN",
                                        id: data.id,
                                        event: event
                                    })
                                })
                                webSocket.addEventListener("message", (event) => {
                                    postMessageToOpener({
                                        type: "CODEMAO_ENVIRONMENT_WEB_SOCKET_MESSAGE",
                                        id: data.id,
                                        event: {
                                            data: event.data
                                        }
                                    })
                                })
                                webSocket.addEventListener("close", (event) => {
                                    postMessageToOpener({
                                        type: "CODEMAO_ENVIRONMENT_WEB_SOCKET_CLOSE",
                                        id: data.id,
                                        event: event
                                    })
                                    delete webSocketRecord[data.id]
                                })
                                webSocket.addEventListener("error", (event) => {
                                    postMessageToOpener({
                                        type: "CODEMAO_ENVIRONMENT_WEB_SOCKET_ERROR",
                                        id: data.id,
                                        event: event
                                    })
                                })
                                webSocketRecord[data.id] = webSocket
                                break
                            case "CODEMAO_ENVIRONMENT_WEB_SOCKET_SEND":
                                webSocketRecord[data.id].send(data.data)
                                break
                            case "CODEMAO_ENVIRONMENT_WEB_SOCKET_CLOSE":
                                webSocketRecord[data.id].close(data.data)
                                break
                        }
                    })
                    postMessageToOpener({
                        type: "COCO_CODEMAO_ENVIRONMENT_SERVER_INIT"
                    })
                }).toString()}}) ()\`) ()
                const types = {
                    type: "SLIGHTNING_COCO_CODEMAO_ENVIRONMENT_SERVER_WIDTH",
                    title: "CoCo 编程猫环境服务",
                    icon: "",
                    isInvisibleWidget: true,
                    isGlobalWidget: true,
                    properties: [],
                    methods: [],
                    events: []
                }
                class Widget extends InvisibleWidget {
                    constructor(props) {
                        super(props)
                    }
                }
                exports.types = types
                exports.widget = Widget
                //`,
            type: "EXTENSION_SLIGHTNING_COCO_CODEMAO_ENVIRONMENT_SERVER_WIDTH"
        })
    }

    ;(function () {
        let originalSend = XMLHttpRequest.prototype.send
        XMLHttpRequest.prototype.send = function(data) {
            if (data instanceof FormData) {
                let fileName = data.get("fname"),
                    originalFile = data.get("file")
                if (fileName == "test.json") {
                    let xhr = this,
                        xhrArguments = arguments
                    let reader = new FileReader()
                    // @ts-ignore
                    reader.readAsText(originalFile)
                    reader.onload = async function() {
                        try {
                            // @ts-ignore
                            let fileContent = JSON.parse(this.result)
                            modifyReleaseFile(fileContent)
                            let blob = new Blob([JSON.stringify(fileContent)], { type: "text/plain" })
                            // @ts-ignore
                            let file = new File([blob], originalFile.name, { type: originalFile.type })
                            data.set("file", file)
                        } catch (error) {
                            console.error(error)
                        }
                        // @ts-ignore
                        originalSend.apply(xhr, xhrArguments)
                    }
                } else {
                    // @ts-ignore
                    originalSend.apply(this, arguments)
                }
            } else {
                // @ts-ignore
                originalSend.apply(this, arguments)
            }
        }
    })()
})()
