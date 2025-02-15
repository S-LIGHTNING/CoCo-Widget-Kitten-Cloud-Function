/** 作品使用的编辑器。*/ export class CodemaoWorkEditor {

    /** Nemo。*/
    public static readonly NEMO: CodemaoWorkEditor = new CodemaoWorkEditor("Nemo", "NEMO")

    /** Kitten。*/
    public static readonly KITTEN: CodemaoWorkEditor = new CodemaoWorkEditor("Kitten", "KITTEN")

    /** Kitten·N。*/
    public static readonly KITTEN_N: CodemaoWorkEditor = new CodemaoWorkEditor("Kitten·N", "NEKO")

    /** Kitten·N。“KittenN”为 Kitten·N 的别名 */
    public static readonly KITTENN: CodemaoWorkEditor = CodemaoWorkEditor.KITTEN_N

    /** Kitten·N。“NEKO”为 Kitten·N 的开发代号 */
    public static readonly NEKO: CodemaoWorkEditor = CodemaoWorkEditor.KITTEN_N

    /** CoCo。*/
    public static readonly COCO: CodemaoWorkEditor = new CodemaoWorkEditor("CoCo", "COCO")

    public static from(argument: string | CodemaoWorkEditor): CodemaoWorkEditor {
        if (argument instanceof CodemaoWorkEditor) {
            return argument
        }
        return CodemaoWorkEditor.parse(argument)
    }

    public static parse(type: string): CodemaoWorkEditor {
        type = type.toUpperCase()
        if (!(type in editorMap)) {
            throw new Error(`无法识别的作品类型：${type}`)
        }
        return editorMap[type as keyof typeof editorMap]
    }

    /** 作品编辑器名称。*/ public readonly name: string
    /** 作品编辑器代号。*/ public readonly code: string
    /** 作品编辑器符号。*/ public readonly symbol: symbol

    private constructor(name: string, code: string) {
        this.name = name
        this.code = code
        this.symbol = Symbol(name)
    }

    public toString(): string {
        return this.name
    }
}

const editorMap = {
    "NEMO": CodemaoWorkEditor.NEMO,
    "KITTEN": CodemaoWorkEditor.KITTEN,
    "KITTEN2": CodemaoWorkEditor.KITTEN,
    "KITTEN3": CodemaoWorkEditor.KITTEN,
    "KITTEN4": CodemaoWorkEditor.KITTEN,
    "NEKO": CodemaoWorkEditor.KITTEN_N,
    "COCO": CodemaoWorkEditor.COCO
}
