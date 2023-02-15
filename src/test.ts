import { json } from "stream/consumers";
import { tokenizer } from "./compiler";

function testParser(
  dartString: string,
  resultTokens: { type: string; value: string }[]
) {
  if (JSON.stringify(tokenizer(dartString)) !== JSON.stringify(resultTokens)) {
    throw new Error("Parser failed:" + `input: ${dartString}`);
  }
}

let testCount = 0

testParser("int a = 12;", [
  { type: "delaration", value: "int a" },
  { type: "assignment", value: "=" },
  { type: "numberLiteral", value: "12" },
  { type: "semicolon", value: ";" },
]);

testCount++

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

testCount++

console.log(`========= All ${testCount} tests passed! ===========`);
console.log("yello")