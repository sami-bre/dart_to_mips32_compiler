import { brotliDecompressSync } from "zlib";
import { tokenizer, getAST, RegisterProvider } from "./compiler";
import { hasUncaughtExceptionCaptureCallback } from "process";

function testTokenizer(
  dartString: string,
  resultTokens: { type: string; value: string }[]
) {
  if (JSON.stringify(tokenizer(dartString)) !== JSON.stringify(resultTokens)) {
    throw new Error(
      "tokenizer failed:" +
        `input: ${dartString} *** produced tokens: ${JSON.stringify(
          tokenizer(dartString)
        )} *** required: ${JSON.stringify(resultTokens)}`
    );
  }
}

function testGetAST(
  tokens: { type: String; value: String }[],
  stringifiedResultAST: any
) {
  if (JSON.stringify(getAST(tokens)) !== stringifiedResultAST) {
    throw new Error(
      "getAst failed:" +
        `input: ${JSON.stringify(
          getAST(tokens)
        )} *** output should be: ${stringifiedResultAST}`
    );
  }
}
('[{"type":"declaration","value":"int a"},{"type":"assignment","value":"="},{"type":"numberLiteral","value":"12"},{"type":"semicolon","value":";"}]');
('[{"type":"declaration","value":"int a"},{"type":"assignment","value":"="},{"type":"numberLiteral","value":"12"},{"type":"semicolon","value":";"}]');
let testCount = 0;

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

testGetAST(
  [
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
  ],
  '{"type":"program","body":[{"type":"assignment","value":"=","left":{"type":"declaration","value":"int a"},"right":{"type":"subtraction","value":"-","left":{"type":"identifier","value":"b"},"right":{"type":"identifier","value":"c"}}},{"type":"assignment","value":"=","left":{"type":"declaration","value":"int f"},"right":{"type":"identifier","value":"c"}}]}'
);

testCount++;

// we'll use this tree to test the getAST function
let result = {
  type: "program",
  body: [
    {
      type: "assignment",
      value: "=",
      left: {
        type: "identifier",
        value: "a",
      },
      right: {
        type: "subtraction",
        value: "-",
        left: {
          type: "identifier",
          value: "b",
        },
        right: {
          type: "identifier",
          value: "c",
        },
      },
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
        value: "int e",
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
        },
      },
    }
  ]
}

testGetAST(
  [
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
  ],
  JSON.stringify(result)
);

testCount++

// testing the register provider

let rp = new RegisterProvider()
if(rp.getSaved() !== "$s0" || rp.getTemp() !== "$t0") {
  throw new Error('Register provider failed. to give the first saved/temp register')
}

for(let i=0; i<10; i++) {
  rp.getSaved()
  rp.getTemp()
}

if(rp.getSaved() !== "$s3" || rp.getTemp() !== "$t1") {
  throw new Error('Register provider failed. to loop around correctly')
}

testCount ++

console.log(`========= All ${testCount} tests passed! ===========`);
