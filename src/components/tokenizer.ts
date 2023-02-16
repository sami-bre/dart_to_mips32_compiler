enum TokenType {
    Identifier,
    Keyword,
    Punctuation,
    Operator,
    StringLiteral,
    NumericLiteral,
    BooleanLiteral,
}

export interface Token {
    type: TokenType;
    value: string;
}

function isKeyword(str: string): boolean {
    const keywords = ["void", "int", "if", "else", "bool", "true", "false", "for", "print"];
    return keywords.includes(str);
}

export function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;

    while (current < code.length) {
        let char = code[current];

        if (char === " ") {
            current++;
            continue;
        }

        if (char === "(" || char === ")") {
            tokens.push({ type: TokenType.Punctuation, value: char });
            current++;
            continue;
        }

        if (char === "{" || char === "}") {
            tokens.push({ type: TokenType.Punctuation, value: char });
            current++;
            continue;
        }

        if (char === "<" || char === ">") {
            tokens.push({ type: TokenType.Operator, value: char });
            current++;
            continue;
        }

        if (char === "=") {
            if (code[current + 1] === "=") {
                tokens.push({ type: TokenType.Operator, value: "==" });
                current += 2;
                continue;
            } else {
                tokens.push({ type: TokenType.Operator, value: char });
                current++;
                continue;
            }
        }

        if (char === "!") {
            if (code[current + 1] === "=") {
                tokens.push({ type: TokenType.Operator, value: "!=" });
                current += 2;
                continue;
            }
        }

        if (char === '"') {
            let value = "";
            char = code[++current];

            while (char !== '"') {
                value += char;
                char = code[++current];
            }

            tokens.push({ type: TokenType.StringLiteral, value });
            current++;
            continue;
        }

        if (/[0-9]/.test(char)) {
            let value = "";

            while (/[0-9]/.test(char)) {
                value += char;
                char = code[++current];
            }

            tokens.push({ type: TokenType.NumericLiteral, value });
            continue;
        }

        if (/[a-zA-Z]/.test(char)) {
            let value = "";

            while (/[a-zA-Z]/.test(char) || /[0-9]/.test(char)) {
                value += char;
                char = code[++current];
            }

            if (isKeyword(value)) {
                tokens.push({ type: TokenType.Keyword, value });
            } else if (value === "true" || value === "false") {
                tokens.push({ type: TokenType.BooleanLiteral, value });
            } else {
                tokens.push({ type: TokenType.Identifier, value });
            }

            continue;
        }

        current++;
    }

    return tokens;
}

function toMIPS32(tokens: Token[]): string {
    let result = '';
  
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      switch (token.type) {
        case 1: // Keyword
          switch (token.value) {
            case 'void':
              result += '.text\n.globl main\nmain:\n';
              break;
            case 'int':
              // MIPS32 does not have a separate data section, so we declare variables in the text section
              // as global labels
              const variableName = tokens[i + 1].value;
              result += `    .globl ${variableName}\n${variableName}:\n`;
              i++; // Skip the variable name token
              break;
            case 'if':
              result += '    beq $0, $0, '; // Placeholder for branch instruction
              const branchInstructionIndex = result.length - 1; // Record the index for the branch instruction
              result += '\n'; // Add a new line for readability
              i += 2; // Skip the left parenthesis and the variable tokens
              const op1 = tokens[i].value;
              const op2 = tokens[i + 2].value;
              i += 3; // Skip the comparison operator and the right parenthesis
              result += `    bne ${op1}, ${op2}, `; // Placeholder for branch instruction
              const elseBranchInstructionIndex = result.length - 1; // Record the index for the else branch instruction
              result += '\n'; // Add a new line for readability
              const ifBlock = parseBlock(tokens.slice(i)); // Parse the if block recursively
              result += ifBlock.mips32; // Append the MIPS32 code for the if block
              i += ifBlock.tokenCount - 1; // Skip the if block tokens
              result += `    j end_if_${branchInstructionIndex}\n`; // Jump to the end of the if statement
              result = replaceAt(result, branchInstructionIndex, `else_${elseBranchInstructionIndex}`); // Replace the placeholder for the branch instruction
              const elseBlock = parseBlock(tokens.slice(i)); // Parse the else block recursively
              result += `else_${elseBranchInstructionIndex}:\n`; // Add the label for the else block
              result += elseBlock.mips32; // Append the MIPS32 code for the else block
              i += elseBlock.tokenCount - 1; // Skip the else block tokens
              result += `end_if_${branchInstructionIndex}:\n`; // Add the label for the end of the if statement
              break;
            case 'bool':
              // Same as int keyword
              const boolVariableName = tokens[i + 1].value;
              result += `    .globl ${boolVariableName}\n${boolVariableName}:\n`;
              i++; // Skip the variable name token
              break;
            case 'for':
              result += '    j '; // Placeholder for jump instruction
              const jumpInstructionIndex = result.length - 1; // Record the index for the jump instruction
              result += '\n'; // Add a new line for readability
              i += 2; // Skip the left parenthesis and the initialization variable token
              const loopVariableName = tokens[i].value;
              i += 2; // Skip the comparison operator and the end condition token
              const endConditionValue = parseInt(tokens[i].value);
              i += 2; // Skip the increment operator and the right parenthesis
            //   const loop
            default:
              throw new Error(`Unexpected keyword: ${token.value}`);
          }
          break;
        case 0: // identifier
          switch (token.value) {
            case "x":
              result += "  li $s0, ";
              break;
            case "y":
              result += "  li $s1, ";
              break;
            case "flag":
              result += "  li $t0, ";
              break;
            case "i":
              // nothing to do
              break;
            default:
              throw new Error(`Unexpected identifier: ${token.value}`);
          }
          break;
        case 3: // assignment operator
          result += token.value;
          break;
        case 5: // integer literal
          result += token.value + "\n";
          break;
        case 2: // symbol
          switch (token.value) {
            case "(":
              result += "  ";
              break;
            case ")":
              result += "\n";
              break;
            case "{":
              result += "\n";
              break;
            case "}":
              result += "\n";
              break;
            default:
              throw new Error(`Unexpected symbol: ${token.value}`);
          }
          break;
        case 4: // string literal
          result += "  li $a0, str" + i + "\n";
          result += "  la $t9, print_string\n";
          result += "  jalr $t9\n";
          result += "str" + i + ": .asciiz \"" + token.value + "\"\n";
          break;
        default:
          throw new Error(`Unexpected token type: ${token.type}`);
      }
    }
  
    return result;
  }
  
  


// Example usage
const code = `void main() {
    int x = 10;
    int y = 20;
    
    if (x < y) {
      print("x is less than y");
    } else {
      print("x is greater than or equal to y");
    }
    
    bool flag = true;
    
    if (flag && x < y) {
      print("flag is true and x is less than y");
    } else {
      print("either flag is false or x is greater than or equal to y");
    }
    
    for (int i = 0; i < 5; i++) {
      print("iteration $i");
    }
  }
  `;

// const tokens: Token[] = [
//     { type: 1, value: 'void' },
//     { type: 0, value: 'main' },
//     { type: 2, value: '(' },
//     { type: 2, value: ')' },
//     { type: 2, value: '{' },
//     { type: 1, value: 'int' },
//     { type: 0, value: 'x' },
//     { type: 3, value: '=' },
//     { type: 5, value: '10' },
//     { type: 1, value: 'int' },
//     { type: 0, value: 'y' },
//     { type: 3, value: '=' },
//     { type: 5, value: '20' },
//     { type: 1, value: 'if' },
//     { type: 2, value: '(' },
//     { type: 0, value: 'x' },
//     { type: 3, value: '<' },
//     { type: 0, value: 'y' },
//     { type: 2, value: ')' },
//     { type: 2, value: '{' },
//     { type: 1, value: 'print' },
//     { type: 2, value: '(' },
//     { type: 4, value: 'x is less than y' },
//     { type: 2, value: ')' },
//     { type: 2, value: '}' },
//     { type: 1, value: 'else' },
//     { type: 2, value: '{' },
//     { type: 1, value: 'print' },
//     { type: 2, value: '(' },
//     { type: 4, value: 'x is greater than or equal to y' },
//     { type: 2, value: ')' },
//     { type: 2, value: '}' },
//     { type: 1, value: 'bool' },
//     { type: 0, value: 'flag' },
//     { type: 3, value: '=' },
//     { type: 1, value: 'true' },
//     { type: 1, value: 'if' },
//     { type: 2, value: '(' },
//     { type: 0, value: 'flag' },
//     { type: 0, value: 'x' },
//     { type: 3, value: '<' },
//     { type: 0, value: 'y' },
//     { type: 2, value: ')' },
//     { type: 2, value: '{' },
//     { type: 1, value: 'print' },
//     { type: 2, value: '(' },
//     { type: 4, value: 'flag is true and x is less than y' },
//     { type: 2, value: ')' },
//     { type: 2, value: '}' },
//     { type: 1, value: 'else' },
//     { type: 2, value: '{' },
//     { type: 1, value: 'print' },
//     { type: 2, value: '(' },
//     {
//         type: 4,
//         value: 'either flag is false or x is greater than or equal to y'
//     },
//     { type: 2, value: ')' },
//     { type: 2, value: '}' },
//     { type: 1, value: 'for' },
//     { type: 2, value: '(' },
//     { type: 1, value: 'int' },
//     { type: 0, value: 'i' },
//     { type: 3, value: '=' },
//     { type: 5, value: '0' },
//     { type: 0, value: 'i' },
//     { type: 3, value: '<' },
//     { type: 5, value: '5' },
//     { type: 0, value: 'i' },
//     { type: 2, value: ')' },
//     { type: 2, value: '{' },
//     { type: 1, value: 'print' },
//     { type: 2, value: '(' },
//     { type: 4, value: 'iteration $i' },
//     { type: 2, value: ')' },
//     { type: 2, value: '}' },
//     { type: 2, value: '}' }
// ]

console.log(generateMips32Code(tokenize(code)));