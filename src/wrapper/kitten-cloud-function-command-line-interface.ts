#!/usr/bin/env node
import { Command } from "commander"
import { KittenCloudFunction } from "../kitten-cloud-function"
const { project } = require("../../project")

const program = new Command()

const language = {
    outputVersionNumber: "输出版本号",
    displayCommandsHelp: "显示命令帮助",
    connectToWork: "连接到作品",
    IDOfWorkToConnectTo: "要连接作品的 ID",
    workIDMustBeInteger: "作品 ID 必须是整数"
}

program
    .name("Kitten-Cloud-Function")
    .alias("kfc")
    .description(project.description)
    .version(project.version, "-v, --version", language.outputVersionNumber)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .helpCommand("help", language.displayCommandsHelp)

program
    .addCommand(
        new Command()
            .name("connect")
            .description(language.connectToWork)
            .helpOption("-h, --help", language.displayCommandsHelp)
            .argument("<work-id>", language.IDOfWorkToConnectTo, parseInt)
            .action((workID: number): void => {
                if (Number.isNaN(workID)) {
                    throw new Error(language.workIDMustBeInteger)
                }
                let connection: KittenCloudFunction = new KittenCloudFunction(workID)
                connection.opened.connect((): void => {
                    console.log("连接成功")
                })
            })
    )

program.parse(process.argv)
