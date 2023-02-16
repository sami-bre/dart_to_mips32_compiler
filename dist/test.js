"use strict";
exports.__esModule = true;
var compiler_1 = require("./compiler");
/*********************************** functions for unit testing *********************************** */
function testTokenizer(dartString, resultTokens) {
    if (JSON.stringify((0, compiler_1.tokenizer)(dartString)) !== JSON.stringify(resultTokens)) {
        throw new Error("TOKENIZER FAILED:" +
            "input: ".concat(dartString, " *** produced tokens: ").concat(JSON.stringify((0, compiler_1.tokenizer)(dartString)), " *** required: ").concat(JSON.stringify(resultTokens)));
    }
}
function testGetAST(tokens, stringifiedResultAST) {
    if (JSON.stringify((0, compiler_1.getAST)(tokens)) !== stringifiedResultAST) {
        throw new Error("getAST FAILED:" +
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
        if (generatorOutput[i] !== correctMipsOutput[i]) {
            throw new Error("GENERATOR FAILED **input AST: ".concat(JSON.stringify(ast), " \n **generator output: ").concat(generatorOutput, " \n        \n **expected output : ").concat(correctMipsOutput, " \n ** these two are different at character ").concat(i, ", around '").concat(generatorOutput.slice(i - 4, i + 4), "' and '").concat(correctMipsOutput.slice(i - 4, i + 4), "'"));
            break;
        }
        i++;
    }
    if (i < correctMipsOutput.length) {
        throw new Error("the generated output has less characters than the correct output");
    }
}
/******************************** function for end-to-end testing ************************************** */
function testEndToEnd(dartCode, correctMipsOutput) {
    var generatedMips = (0, compiler_1.compiler)(dartCode);
    var i = 0;
    while (i < generatedMips.length) {
        if (generatedMips[i] !== correctMipsOutput[i]) {
            throw new Error("END-TO-END FAILED **input code: ".concat(dartCode, " \n **generated code: ").concat(generatedMips, " \n        \n **expected output : ").concat(correctMipsOutput, " \n ** these two are different at character ").concat(i, ", around '").concat(generatedMips.slice(i - 4, i + 4), "' and '").concat(correctMipsOutput.slice(i - 4, i + 4), "'"));
            break;
        }
        i++;
    }
    if (i < generatedMips.length) {
        throw new Error("the generated mips code has less characters than the correct output");
    }
}
/*************************************************** testing begins here **************************************************** */
var testCount = 0;
testTokenizer("int a = 12;", [
    { type: "declaration", value: "int a" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "12" },
    { type: "semicolon", value: ";" },
]);
testCount++;
testTokenizer("int a = 12; print(a);", [
    { type: "declaration", value: "int a" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "12" },
    { type: "semicolon", value: ";" },
    { type: "print", value: "a" },
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
testTokenizer("print(223);int a= b+c;", [
    { type: "print", value: "223" },
    { type: "semicolon", value: ";" },
    { type: "declaration", value: "int a" },
    { type: "assignment", value: "=" },
    { type: "identifier", value: "b" },
    { type: "addition", value: "+" },
    { type: "identifier", value: "c" },
    { type: "semicolon", value: ";" },
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
    { type: "print", value: "a" },
    { type: "semicolon", value: ";" },
], '{"type":"program","body":[{"type":"assignment","value":"=","left":{"type":"declaration","value":"int a"},"right":{"type":"subtraction","value":"-","left":{"type":"identifier","value":"b"},"right":{"type":"identifier","value":"c"}}},{"type":"assignment","value":"=","left":{"type":"declaration","value":"int f"},"right":{"type":"identifier","value":"c"}},{"type":"print","value":"a"}]}');
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
//remember the format of the correct mips output ... 'statement \nstatement ... \nstatement \n'
"sub $t0, $s1, $s2 \nmove $s0, $t0 \nli $t1, 13 \nadd $t2, $t1, $s2 \nmove $s4, $t2 \n");
testCount++;
// testing if the compiler complains when given an incorrect dart code (missing semicolon)
var errorThrown = true;
try {
    testEndToEnd("int zar", ""); // this should throw an error
    errorThrown = false; // hence, this should not execute
}
catch (error) { }
if (!errorThrown) {
    throw new Error("the compiler is not complaining when a semicolon is missing at the end of the dart code.");
}
testCount++;
// testing if the compiler complains when given an undefined identifier in the dart code
errorThrown = true;
try {
    testEndToEnd("int zar; int a = 0; a = a - k", ""); // this should throw an error
    errorThrown = false; // hence, this should not execute
}
catch (error) { }
if (!errorThrown) {
    throw new Error("the compiler is not complaining when a there is an undefined identifier the dart code.");
}
testCount++;
testEndToEnd("int g = 12 + 14; int c; c = g; c = c-2;", "li $t0, 12 \nli $t1, 14 \nadd $t2, $t0, $t1 \nmove $s0, $t2 \nmove $s1, $s0 \nli $t3, 2 \nsub $t4, $s1, $t3 \nmove $s1, $t4 \n");
testCount++;
testEndToEnd("int foo = 3; int bar = 5; int c; int D; c = D; bar = c - D; foo = c + bar;", "li $t0, 3 \nmove $s0, $t0 \nli $t1, 5 \nmove $s1, $t1 \nmove $s2, $s3 \nsub $t2, $s2, $s3 \nmove $s1, $t2 \nadd $t3, $s2, $s1 \nmove $s0, $t3 \n");
testCount++;
console.log("========= All ".concat(testCount, " tests passed! ==========="));
