import { generate } from "./code-generator";
import { getAST } from "./parser";
import { symbolTable } from "./symbol-table";
import { tokenizer } from "./tokenizer";
export class Compiler {
    translate(dartString) {
        const tokenized = tokenizer(dartString);
        const abstractSyntaxTree = getAST(tokenized);
        return generate(abstractSyntaxTree, symbolTable);
    }
}
