"use strict";
exports.__esModule = true;
var compiler_1 = require("./compiler");
function testParser(dartString, resultTokens) {
    if (JSON.stringify((0, compiler_1.tokenizer)(dartString)) !== JSON.stringify(resultTokens)) {
        throw new Error("Parser failed:" + "input: ".concat(dartString));
    }
}
var testCount = 0;
testParser("int a = 12;", [
    { type: "delaration", value: "int a" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "12" },
    { type: "semicolon", value: ";" },
]);
testCount++;
testParser("int a = 12; int b = 4;", [
    { type: "delaration", value: "int a" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "12" },
    { type: "semicolon", value: ";" },
    { type: "delaration", value: "int b" },
    { type: "assignment", value: "=" },
    { type: "numberLiteral", value: "4" },
    { type: "semicolon", value: ";" },
]);
testCount++;
console.log("========= All ".concat(testCount, " tests passed! ==========="));
console.log("yello");
