"use strict";
exports.__esModule = true;
exports.tokenizer = void 0;
function tokenizer(dartString) {
    var tokens = [];
    var current = 0; // used to track where we are in the program string
    while (current < dartString.length) {
        if (dartString[current] === ";") {
            // semicolon is a token
            tokens.push({ type: "semicolon", value: ";" });
            current++;
            continue;
        }
        else if (dartString[current] === "=") {
            // the equal sign is a token
            tokens.push({ type: "assignment", value: "=" });
            current++;
        }
        else if (dartString.startsWith("int", current)) {
            // 'int myNumber' is a token
            // we have an integer variable declaration
            var tokenValue = "int ";
            current += 4;
            // let's skip some spaces, should they exist
            while (dartString[current] === " ") {
                current++;
            }
            while (![" ", ";", "="].includes(dartString[current])) {
                tokenValue += dartString[current];
                current++;
            }
            tokens.push({ type: "declaration", value: tokenValue });
        }
        else if (['"', "'"].includes(dartString[current])) {
            // strings are tokens
            throw new Error("not implemented");
        }
        else if (new RegExp("^[0-9]$").test(dartString[current])) {
            // numbers are tokens, like 325
            var tokenValue = "";
            while (new RegExp("^[0-9]$").test(dartString[current])) {
                tokenValue += dartString[current];
                current++;
            }
            tokens.push({ type: "numberLiteral", value: tokenValue });
        }
        else if (dartString[current] === "+") {
            // the add symbol is a token
            tokens.push({ type: "addition", value: "+" });
            current++;
        }
        else if (dartString[current] === "-") {
            // the subtract symbol is a token
            tokens.push({ type: "subtraction", value: "-" });
            current++;
        }
        else if (dartString[current] === "*") {
            // multiply sign is a token
            throw new Error("not implemented");
        }
        else if (dartString[current] === "/") {
            throw new Error("not implemented");
        }
        else if (dartString[current] === " ") {
            // we want to skip spaces
            current++;
            continue;
        }
        else if (new RegExp("[a-zA-Z]").test(dartString[current])) {
            // identifiers start with a letter
            var tokenValue = "";
            while (current < dartString.length &&
                new RegExp("^[a-zA-Z0-9_]*$").test(dartString[current])) {
                tokenValue += dartString[current];
                current++;
            }
            tokens.push({ type: "identifier", value: tokenValue });
        }
        else if (dartString.startsWith("if", current)) {
            // 'if' statement is a token
            var tokenValue = "if";
            current += 2;
            // let's skip some spaces, should they exist
            while (dartString[current] === " ") {
                current++;
            }
            tokens.push({ type: "ifStatement", value: tokenValue });
        }
        else if (dartString.startsWith("else", current)) {
            // 'else' statement is a token
            var tokenValue = "else";
            current += 4;
            // let's skip some spaces, should they exist
            while (dartString[current] === " ") {
                current++;
            }
            tokens.push({ type: "elseStatement", value: tokenValue });
        }
        else if (dartString.startsWith("while", current)) {
            // 'while' statement is a token
            var tokenValue = "while";
            current += 5;
            // let's skip some spaces, should they exist
            while (dartString[current] === " ") {
                current++;
            }
            tokens.push({ type: "whileStatement", value: tokenValue });
        }
        else if (dartString.startsWith("for", current)) {
            // 'for' statement is a token
            var tokenValue = "for";
            current += 3;
            // let's skip some spaces, should they exist
            while (dartString[current] === " ") {
                current++;
            }
            tokens.push({ type: "forStatement", value: tokenValue });
        }
        else if (dartString.startsWith("true", current)) {
            // 'true' keyword is a token
            var tokenValue = "true";
            current += 4;
            tokens.push({ type: "booleanLiteral", value: tokenValue });
        }
        else if (dartString.startsWith("false", current)) {
            // 'false' keyword is a token
            var tokenValue = "false";
            current += 5;
            tokens.push({ type: "booleanLiteral", value: tokenValue });
        }
        else if (dartString.startsWith("==", current)) {
            // '==' is a token for comparison
            var tokenValue = "==";
            current += 2;
            tokens.push({ type: "comparison", value: tokenValue });
        }
        else if (dartString.startsWith("!=", current)) {
            // '!=' is a token for comparison
            var tokenValue = "!=";
            current += 2;
            tokens.push({ type: "comparison", value: tokenValue });
        }
        else if (dartString.startsWith("<", current)) {
            // '<' is a token for comparison
            var tokenValue = "<";
            current++;
            tokens.push({ type: "comparison", value: tokenValue });
        }
        else if (dartString.startsWith("<=", current)) {
            // '<=' is a token for comparison
            var tokenValue = "<=";
            current += 2;
            tokens.push({ type: "comparison", value: tokenValue });
        }
        else if (dartString.startsWith(">", current)) {
            // '>' is a token for comparison
            var tokenValue = ">";
            current++;
            tokens.push({ type: "comparison", value: tokenValue });
        }
        else if (dartString.startsWith(">=", current)) {
            // '>=' is a token for comparison
            var tokenValue = ">=";
            current += 2;
            tokens.push({ type: "comparison", value: tokenValue });
        }
        else if (dartString.startsWith("&&", current)) {
            // '&&' is a token for logical and
            var tokenValue = "&&";
            current += 2;
            tokens.push({ type: "comparison", value: tokenValue });
        }
        else if (dartString.startsWith("||", current)) {
            // '&&' is a token for logical and
            var tokenValue = "||";
            current += 2;
            tokens.push({ type: "comparison", value: tokenValue });
        }
        else if (dartString.startsWith("&&", current)) {
            // '&&' is a token for logical and
            var tokenValue = "&&";
            current += 2;
            tokens.push({ type: "comparison", value: tokenValue });
        }
        else {
            // if all fails, throw an error
            // throw new Error("unknown token at position ".concat(current));
            console.log(dartString); 
            break;
        }
    }
    return tokens;
}
exports.tokenizer = tokenizer;
console.log(tokenizer("void main() {\n    int x = 10;\n    int y = 20;\n    \n    if (x < y) {\n      print(\"x is less than y\");\n    } else {\n      print(\"x is greater than or equal to y\");\n    }\n    \n    bool flag = true;\n    \n    if (flag && x < y) {\n      print(\"flag is true and x is less than y\");\n    } else {\n      print(\"either flag is false or x is greater than or equal to y\");\n    }\n    \n    for (int i = 0; i < 5; i++) {\n      print(\"iteration $i\");\n    }\n  }\n  "));
