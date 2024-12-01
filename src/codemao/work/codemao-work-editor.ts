/** 作品使用的编辑器。*/ export class CodemaoWorkEditor {

    /** 作品使用的编辑器为 Nemo。*/ static readonly NEMO: CodemaoWorkEditor = new CodemaoWorkEditor("NEMO")
    /** 作品使用的编辑器为 Kitten。*/ static readonly KITTEN: CodemaoWorkEditor = new CodemaoWorkEditor("KITTEN")
    /** 作品使用的编辑器为 Kitten·N。*/ static readonly KITTEN_N: CodemaoWorkEditor = new CodemaoWorkEditor("Kitten·N")
    /** 作品使用的编辑器为 CoCo。*/ static readonly COCO: CodemaoWorkEditor = new CodemaoWorkEditor("COCO")

    static from(argument: string | CodemaoWorkEditor): CodemaoWorkEditor {
        if (argument instanceof CodemaoWorkEditor) {
            return argument
        }
        return CodemaoWorkEditor.parse(argument)
    }

    static parse(type: string): CodemaoWorkEditor {
        type = type.toUpperCase()
        if (!(type in editorMap)) {
            throw new Error(`无法识别的作品类型：${type}`)
        }
        return editorMap[type as keyof typeof editorMap]
    }

    /** 作品编辑器名称。*/ public readonly name: string
    /** 作品编辑器符号。*/ public readonly symbol: symbol

    private constructor(name: string) {
        this.name = name
        this.symbol = Symbol(name)
    }

    public toString() {
        return this.name
    }
}

const editorMap = {
    "NEMO": CodemaoWorkEditor.NEMO,
    "KITTEN": CodemaoWorkEditor.KITTEN,
    "KITTEN2": CodemaoWorkEditor.KITTEN,
    "KITTEN3": CodemaoWorkEditor.KITTEN,
    "KITTEN4": CodemaoWorkEditor.KITTEN,
    "COCO": CodemaoWorkEditor.COCO
}
