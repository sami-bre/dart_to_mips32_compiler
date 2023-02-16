"use strict";
exports.__esModule = true;
var compiler_1 = require("./compiler");
function testTokenizer(dartString, resultTokens) {
    if (JSON.stringify((0, compiler_1.tokenizer)(dartString)) !== JSON.stringify(resultTokens)) {
        throw new Error("tokenizer failed:" +
            "input: ".concat(dartString, " *** produced tokens: ").concat(JSON.stringify((0, compiler_1.tokenizer)(dartString)), " *** required: ").concat(JSON.stringify(resultTokens)));
    }
}
function testGetAST(tokens, stringifiedResultAST) {
    if (JSON.stringify((0, compiler_1.getAST)(tokens)) !== stringifiedResultAST) {
        throw new Error("getAst failed:" +
            "input: ".concat(JSON.stringify((0, compiler_1.getAST)(tokens)), " *** output should be: ").concat(stringifiedResultAST));
    }
}
function testGenerator(ast, correctMipsOutput) {
    var symbolTable = new compiler_1.SymbolTable(new compiler_1.RegisterProvider());
    var generatorOutput = (0, compiler_1.generator)(ast, symbolTable);
    // if there's a difference between the generated and the correct outputs, we'll
    // get the index where the difference starts and trow an error
    var i = 0;
    while (i < generatorOutput.length) {
        if (generatorOutput[i] != correctMipsOutput[i]) {
            throw new Error("generator failed. **input AST: ".concat(JSON.stringify(ast), " \n **generator output: ").concat(generatorOutput, " \n        \n **expected output : ").concat(correctMipsOutput, " \n ** these two are different at character ").concat(i, ", around '").concat(generatorOutput.slice(i - 2, i + 2), "' and '").concat(correctMipsOutput.slice(i - 2, i + 2), "'"));
            break;
        }
        i++;
    }
}
var testCount = 0;
testTokenizer("int a = 12;", [
    { type: "declaration", value: "int a" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "12" },
    { type: "semicolon", value: ";" },
]);
testCount++;
testTokenizer("int a = 12; int b = 4;", [
    { type: "declaration", value: "int a" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "12" },
    { type: "semicolon", value: ";" },
    { type: "declaration", value: "int b" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "4" },
    { type: "semicolon", value: ";" },
]);
testCount++;
testTokenizer("a=120", [
    { type: "identifier", value: "a" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "120" },
]);
testCount++;
testTokenizer("int a= b+c", [
    { type: "declaration", value: "int a" },
    { type: "assignment", value: "=" },
    { type: "identifier", value: "b" },
    { type: "addition", value: "+" },
    { type: "identifier", value: "c" },
]);
testCount++;
testGetAST([
    { type: "declaration", value: "int a" },
    { type: "assignment", value: "=" },
    { type: "identifier", value: "b" },
    { type: "subtraction", value: "-" },
    { type: "identifier", value: "c" },
    { type: "semicolon", value: ";" },
    { type: "declaration", value: "int f" },
    { type: "assignment", value: "=" },
    { type: "identifier", value: "c" },
    { type: "semicolon", value: ";" },
], '{"type":"program","body":[{"type":"assignment","value":"=","left":{"type":"declaration","value":"int a"},"right":{"type":"subtraction","value":"-","left":{"type":"identifier","value":"b"},"right":{"type":"identifier","value":"c"}}},{"type":"assignment","value":"=","left":{"type":"declaration","value":"int f"},"right":{"type":"identifier","value":"c"}}]}');
testCount++;
// we'll use this tree to test the getAST function
var result = {
    type: "program",
    body: [
        {
            type: "assignment",
            value: "=",
            left: {
                type: "identifier",
                value: "a"
            },
            right: {
                type: "subtraction",
                value: "-",
                left: {
                    type: "identifier",
                    value: "b"
                },
                right: {
                    type: "identifier",
                    value: "c"
                }
            }
        },
        {
            type: "declaration",
            value: "int d"
        },
        {
            type: "assignment",
            value: "=",
            left: {
                type: "declaration",
                value: "int e"
            },
            right: {
                type: "addition",
                value: "+",
                left: {
                    type: "numberLiteral",
                    value: "13"
                },
                right: {
                    type: "identifier",
                    value: "c"
                }
            }
        },
    ]
};
testGetAST([
    { type: "identifier", value: "a" },
    { type: "assignment", value: "=" },
    { type: "identifier", value: "b" },
    { type: "subtraction", value: "-" },
    { type: "identifier", value: "c" },
    { type: "semicolon", value: ";" },
    { type: "declaration", value: "int d" },
    { type: "semicolon", value: ";" },
    { type: "declaration", value: "int e" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "13" },
    { type: "addition", value: "+" },
    { type: "identifier", value: "c" },
    { type: "semicolon", value: ";" },
], JSON.stringify(result));
testCount++;
// ******************* testing the register provider ***************************
var rp = new compiler_1.RegisterProvider();
if (rp.getSaved() !== "$s0" || rp.getTemp() !== "$t0") {
    throw new Error("Register provider failed. to give the first saved/temp register");
}
for (var i = 0; i < 10; i++) {
    rp.getSaved();
    rp.getTemp();
}
if (rp.getSaved() !== "$s3" || rp.getTemp() !== "$t1") {
    throw new Error("Register provider failed. to loop around correctly");
}
testCount++;
testGenerator({
    type: "program",
    body: [
        {
            type: "declaration",
            value: "int a"
        },
        {
            type: "declaration",
            value: "int b"
        },
        {
            type: "declaration",
            value: "int c"
        },
        {
            type: "assignment",
            value: "=",
            left: {
                type: "identifier",
                value: "a"
            },
            right: {
                type: "subtraction",
                value: "-",
                left: {
                    type: "identifier",
                    value: "b"
                },
                right: {
                    type: "identifier",
                    value: "c"
                }
            }
        },
        {
            type: "declaration",
            value: "int d"
        },
        {
            type: "assignment",
            value: "=",
            left: {
                type: "declaration",
                value: "int e"
            },
            right: {
                type: "addition",
                value: "+",
                left: {
                    type: "numberLiteral",
                    value: "13"
                },
                right: {
                    type: "identifier",
                    value: "c"
                }
            }
        },
    ]
}, 
//remember the format of the correct mips output ... 'statement \nstatement \nstatement...'
"sub $t0, $s1, $s2 \nmove $s0, $t0 \nli $t1, 13 \nadd $t2, $t1, $s2 \nmove $s4, $t2 \n");
testCount++;
console.log("========= All ".concat(testCount, " tests passed! ==========="));
