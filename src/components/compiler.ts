import { generate } from "./code-generator";
import { getAST } from "./parser";
import { symbolTable } from "./symbol-table";
import { tokenize } from "./tokenizer";

export class Compiler {
    translate( dartString: string ) {
        const tokenized = tokenize( dartString );
        const abstractSyntaxTree = getAST( tokenized );
        return generate( abstractSyntaxTree, symbolTable );
    }
}