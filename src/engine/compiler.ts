//***********************************THE TOKENIZER*********************************** */

export function tokenizer(
  dartString: String
): { type: String; value: String }[] {
  let tokens: { type: String; value: String }[] = [];
  let current = 0; // used to track where we are in the program string

  while (current < dartString.length) {
    if (dartString[current] == ";") {
      // semicolon is a token
      tokens.push({ type: "semicolon", value: ";" });
      current++;
      continue;
    } else if (dartString[current] == "=") {
      // the equal sign is a token
      tokens.push({ type: "assignment", value: "=" });
      current++;
    } else if (dartString.startsWith("int", current)) {
      // 'int myNumber' is a token
      // we have an integer variable declaration
      let tokenValue = "int ";
      current += 4;
      // let's skip some speces, should they exist
      while (dartString[current] == " ") current++;
      while (
        current < dartString.length &&
        ![" ", ";", "="].includes(dartString[current])
      ) {
        tokenValue += dartString[current];
        current++;
      }
      tokens.push({ type: "declaration", value: tokenValue });
    } else if (['"', "'"].includes(dartString[current])) {
      // strings are tokens
      throw new Error("not implemented");
    } else if (new RegExp("^[0-9]$").test(dartString[current])) {
      // numbers are tokens, like 325
      let tokenValue = "";
      while (new RegExp("^[0-9]$").test(dartString[current])) {
        tokenValue += dartString[current];
        current++;
      }
      tokens.push({ type: "numberLiteral", value: tokenValue });
    } else if (dartString[current] == "+") {
      // the add symbol is a token
      tokens.push({ type: "addition", value: "+" });
      current++;
    } else if (dartString[current] == "-") {
      // the subtract symbol is a token
      tokens.push({ type: "subtraction", value: "-" });
      current++;
    } else if (dartString[current] == "*") {
      // multiply sign is a token
      throw new Error("not implemented");
    } else if (dartString[current] == "/") {
      throw new Error("not implemented");
    } else if(dartString.startsWith("print(", current)) {   
      // the print statement is a token
      current += 6;
      let tokenValue =''
      while(current < dartString.length && dartString[current] != ')'){
        tokenValue += dartString[current]
        current++;
      }
      tokens.push({type: "print", value: tokenValue});
      current++;
    }
     else if (dartString[current] == " ") {
      // we want to skip spaces
      current++;
      continue;
    } else if (new RegExp("[a-zA-Z]").test(dartString[current])) {
      // identifiers start with a letter
      let tokenValue = "";
      while (
        current < dartString.length &&
        new RegExp("^[a-zA-Z0-9_]*$").test(dartString[current])
      ) {
        tokenValue += dartString[current];
        current++;
      }
      tokens.push({ type: "identifier", value: tokenValue });
    } else {
      // if all fails, throw an error
      throw new Error(`unknown token at position ${current}`);
    }
  }

  return tokens;
}

//*************************************THE PARSER************************************* */

export interface ProgramNode {
  type: String;
  body: {}[];
}

export function getAST(tokens: { type: String; value: String }[]) {
  const programNode: ProgramNode = {
    type: "program",
    body: [],
  };
  // let's build the body of the topmost node (programNode) first
  // the body will contain statements (groups of tokens)
  // first split the tokens with the semicolon token (leaving the semicolons out)
  let tokenGroup: { type: String; value: String }[] = [];
  let statements = []; // this will be a list of group of tokens, each group composing a statement.
  let counter = 0;
  while (counter < tokens.length) {
    if (tokens[counter].type == "semicolon") {
      // we push what we have in the token group to the program body
      statements.push(tokenGroup);
      tokenGroup = [];
      counter++;
    }
    tokenGroup.push(tokens[counter]);
    counter++;
  }

  // in case there's a missing semicolon after the last statement ...
  if (tokenGroup[0]) {
    throw new Error("there is a missing semicolon after the last statement");
  }

  // now we have all the statement-forming tokens grouped together in tokenGroups.

  // a function to check if a token group contains a specific token type
  function contains(
    listOfTokens: { type: String; value: String }[],
    requiredType: String
  ) {
    // returns index if token exists, otherwise -1
    for (let i = 0; i < listOfTokens.length; i++) {
      if (listOfTokens[i].type == requiredType) return i;
    }
    return -1;
  }

  // a function to parse each statement
  function parser(statement: { type: String; value: String }[]): any {
    // we're having the tokens now.
    // we first check if stmnt has = in it
    let index = contains(statement, "assignment");
    if (index != -1) {
      // create an assignment node
      let assignmentNode = {
        type: "assignment",
        value: "=",
        left: parser(statement.slice(0, index)),
        right: parser(statement.slice(index + 1)),
      };
      return assignmentNode;
    }

    // then we check for add/sub
    index = contains(statement, "addition");
    if (index != -1) {
      let additionNode = {
        type: "addition",
        value: "+",
        left: parser(statement.slice(0, index)),
        right: parser(statement.slice(index + 1)),
      };
      return additionNode;
    }

    index = contains(statement, "subtraction");
    if (index != -1) {
      let subtractionNode = {
        type: "subtraction",
        value: "-",
        left: parser(statement.slice(0, index)),
        right: parser(statement.slice(index + 1)),
      };
      return subtractionNode;
    }

    // nextup, check for declarations, identifiers, literals and print tokens
    // at this point, the token group should only have one token b/c the above 3 are our only binary operators
    if (statement.length > 1) {
      throw new Error(
        `token group is expected to have 1 token only. but it has ${statement.length}`
      );
    }

    let token = statement[0];
    // this token is returned as a node itself
    return token;
  }

  // at this point, the program body contains list of tokenGroups.
  // let's replace the tokenGropus with their corresponding nodes
  for (let i = 0; i < statements.length; i++) {
    programNode.body.push(parser(statements[i]));
  }

  // finally, return the program node
  return programNode;
}

//******************************THE REGISTER PROVIDER CLASS**************************/

export class RegisterProvider {
  // this class gives new empty registers when asked and compromises by
  // recycling registers if required.

  private currentSaved: number = 0; // the current available saved register number
  private maxSaved: number = 8; // the maximum saved register number (7 for mips-32) +1 for modulp purposes
  private currentTemp: number = 0; // the current available temporary register number
  private maxTemp: number = 10; // the maximum temporary register number (9 for mips-32) +1 for modulo purposes

  getSaved(): String {
    let num = this.currentSaved % this.maxSaved;
    this.currentSaved++;
    return "$s" + num;
  }

  getTemp(): String {
    let num = this.currentTemp % this.maxTemp;
    this.currentTemp++;
    return "$t" + num;
  }
}

// now create a singleton global registerProvider object
const registerProvider = new RegisterProvider();

/*******************************THE SYMBOL TABLE*******************************/

export interface Symbol {
  name: String;
  register: String;
  type: "int" | "string";
}
export class SymbolTable {
  private table: Symbol[] = [];
  registerProvider;

  constructor(regProv: RegisterProvider) {
    this.registerProvider = regProv;
  }

  setSymbol(identifier: String, type: "int" | "string"): String {
    // if symbol already exists, throw error (b/c we're trying to re-declare it)
    let i = 0;
    while (i < this.table.length) {
      if (this.table[i].name == identifier) {
        throw new Error(`the identifier ${identifier} is already declared.`);
      }
      i++;
    }
    // otherwise, create a symbol and set it. then return the new register
    let symbol: Symbol = {
      name: identifier,
      register: this.registerProvider.getSaved(),
      type: type,
    };
    this.table.push(symbol);
    return symbol.register;
  }

  getSymbol(identifier: String): Symbol | null {
    // we return the symbol if it exists. otherwise, null
    let i = 0;
    while (i < this.table.length) {
      if (this.table[i].name == identifier) {
        return this.table[i];
      }
      i++;
    }
    return null;
  }
}

// now create a singleton global symbolTable object
// and pass it the singleton global registerProvider so they get connected
const symbolTable = new SymbolTable(registerProvider);

/*************************** THE CODE GENERATOR **************************** */

export function generator(
  programNode: ProgramNode,
  symbolTable: SymbolTable
): String {
  let outputString = "";
  // parse each root node in the programNode's body and append the resulting string to the output string
  for (let node of programNode.body) {
    generate(node);
  }

  function generate(node: any): String | void {
    // check for declaration node
    if (node.type == "declaration") {
      // get the new identifier and add it to the symbol table, then return the new register.
      if (node.value.startsWith("int")) {
        let register = symbolTable.setSymbol(node.value.slice(3).trim(), "int");
        return register;
      } else if (node.value.startsWith("string")) {
        throw new Error("string features not implemented yet");
      } else {
        throw new Error(`unknown type: ${node.value}`);
      }
    }

    // checking for number literal
    if (node.type == "numberLiteral") {
      // get a temporary register, and return the register.
      // and uppend mips code to to move the literal into the temp register
      let register = symbolTable.registerProvider.getTemp();
      outputString += `li ${register}, ${node.value} \n`;
      return register;
    }

    // checking for string literal
    if (node.type == "stringLiteral") {
      throw new Error("string features not implemented yet");
    }

    // checking for an identifier node
    if (node.type == "identifier") {
      // first get the symbol for the identifier or throw error if symbol doesn't exist
      let symbol = symbolTable.getSymbol(node.value);
      if (!symbol) {
        throw new Error(`unknown identifier: ${node.value}`);
      }
      if (symbol.type == "string") {
        // in case the identifier is of type string ...
        throw new Error("string features not implemented yet");
      }
      // then just return the register associated with the identifier (variable)
      return symbol.register;
    }

    // checking for addition / subtraction
    if (node.type == "addition" || node.type == "subtraction") {
      // get the left and right registers that result from calling generate on the operands, get
      // a temporary register, write mips to add the operand registers into the temp register
      // and finally return the temp register
      let leftRegister = generate(node.left);
      let rightRegister = generate(node.right);
      let tempRegister = symbolTable.registerProvider.getTemp();
      let opWord = node.type == "addition" ? "add" : "sub";
      outputString += `${opWord} ${tempRegister}, ${leftRegister}, ${rightRegister} \n`;
      return tempRegister;
    }

    // check for print
    if(node.type == "print"){
      // printee is the value of the print token.
      // check if printee identifier and proceed
      let register = symbolTable.getSymbol(node.value)?.register
      if(register){ // printee is an identifier with type int
        // write the relevant mips to print the value of the identifier
        outputString += `li $v0, 1 \nmove $a0, ${register} \nsyscall \n`
        return
      } else if(new RegExp("^[0-9]*$").test(node.value)) { // check if printee number literal and proceed
        outputString += `li $v0, 1 \nli $a0, ${node.value} \nsyscall`
        return
      } else {
        // printee is neither an identifier nor a number literal. complain.
        throw new Error("invalid argument to a print statement.")
      }
    }

    // finally, check for assignment node
    if (node.type == "assignment") {
      // do some validations and throw relevant errors
      if (!["declaration", "identifier"].includes(node.left.type)) {
        throw new Error(
          `wront usage of assignment (=) operator: = between ${node.left.value} and ${node.right.value}`
        );
      }
      // now call generate on the two operands and get corresponding registers, then write
      // mips to move the value of the right register into the left register
      let leftRegister = generate(node.left);
      let rightRegister = generate(node.right);
      outputString += `move ${leftRegister}, ${rightRegister} \n`;
    }
  }
  return outputString;
}

/*********************************** THE COMPILER ************************************* */

export function compiler(dartCode: String): String {
  // we need a global singleton symbol table
  const symbolTable = new SymbolTable(new RegisterProvider());
  let tokens = tokenizer(dartCode);
  let ast = getAST(tokens);
  let mipsCode = generator(ast, symbolTable);
  return mipsCode;
}

