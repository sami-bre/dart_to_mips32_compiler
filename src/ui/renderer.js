let openFiles = [{ name: "live", content: "" }];
let currentFileIndex = 0;

// the add file button
var addFileBtn = document.getElementById("add-file");
addFileBtn.addEventListener("click", chooseFile);

// the code editing area
var editArea = document.getElementById("edit-area");
editArea.onchange = textAreaChange;

// the tab-container
let tabContainer = document.getElementById("tab-container")

// the compile button
let compileBtn = document.getElementById("compile-btn")
compileBtn.addEventListener("click", compileCurrentFile)

// the mips output
let outputArea = document.getElementById("output-area");

// the error console
let errorConsole = document.getElementById("console-area")

console.log({outputArea, errorConsole,})

let fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.addEventListener("change", loadFile);

// load (switch to) the live file
switchFile(0)

function chooseFile(e) {
  fileInput.click();
}

function loadFile(e) {
  let file = e.target.files[0];

  let reader = new FileReader();
  reader.readAsText(file);

  // when the reader finishes reading ...
  reader.onload = (readerEvent) => {
    let fileContent = readerEvent.target.result; // this is the content
    console.log(fileContent);
    // add the content to the array of files
    openFiles.push({ name: file.name, content: fileContent });
    // switch to the new file
    switchFile(openFiles.length - 1)
    console.log(openFiles.length)
  };
}

function switchFile(index) {
    currentFileIndex = index;
    editArea.value = openFiles[index].content;
    console.log(openFiles[index].content)
    // add a new tab, select it, and render all the other tabs as unselected
    tabContainer.innerHTML = ""
    for(let i=0; i<openFiles.length; i++) {
        tabContainer.innerHTML += i == index 
        ? `<button class="text-white bg-gray-500 rounded-lg px-3 py-1 mr-1 hover:bg-gray-400" onclick="switchFile(${i})">${openFiles[i].name}</button>`
        : `<button class="text-gray-300 bg-gray-700 px-3 py-1 mr-1 hover:bg-gray-400" onclick="switchFile(${i})">${openFiles[i].name}</button>`
    }
}

function textAreaChange() {
  let newContent = editArea.value;
  openFiles[currentFileIndex].content = newContent
}


function compileCurrentFile() {
    try {
        let processedText = preProcessor(openFiles[currentFileIndex].content)
        let mipsOutput = compiler(processedText)
        outputArea.value = mipsOutput;
        errorConsole.value = "";
    } catch (error) {
        errorConsole.value = error;
        outputArea.value = "";
    }
  
}

/*********************************** THE PRE-PROCESSOR *************************************** */

function preProcessor(inputText) {
    // now we just replace new-line characters with space (" ")
    let processedText = inputText.replace(/\r?\n|\r/g, " ")
    return processedText;
}


//***********************************THE TOKENIZER*********************************** */
function tokenizer(dartString) {
    var tokens = [];
    var current = 0; // used to track where we are in the program string
    while (current < dartString.length) {
        if (dartString[current] == ";") {
            // semicolon is a token
            tokens.push({ type: "semicolon", value: ";" });
            current++;
            continue;
        }
        else if (dartString[current] == "=") {
            // the equal sign is a token
            tokens.push({ type: "assignment", value: "=" });
            current++;
        }
        else if (dartString.startsWith("int", current)) {
            // 'int myNumber' is a token
            // we have an integer variable declaration
            var tokenValue = "int ";
            current += 4;
            // let's skip some speces, should they exist
            while (dartString[current] == " ")
                current++;
            while (current < dartString.length &&
                ![" ", ";", "="].includes(dartString[current])) {
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
        else if (dartString[current] == "+") {
            // the add symbol is a token
            tokens.push({ type: "addition", value: "+" });
            current++;
        }
        else if (dartString[current] == "-") {
            // the subtract symbol is a token
            tokens.push({ type: "subtraction", value: "-" });
            current++;
        }
        else if (dartString[current] == "*") {
            // multiply sign is a token
            throw new Error("not implemented");
        }
        else if (dartString[current] == "/") {
            throw new Error("not implemented");
        }
        else if (dartString.startsWith("print(", current)) {
            // the print statement is a token
            current += 6;
            var tokenValue = '';
            while (current < dartString.length && dartString[current] != ')') {
                tokenValue += dartString[current];
                current++;
            }
            tokens.push({ type: "print", value: tokenValue });
            current++;
        }
        else if (dartString[current] == " ") {
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
        else {
            // if all fails, throw an error
            throw new Error("unknown token at position ".concat(current));
        }
    }
    return tokens;
}





function getAST(tokens) {
    var programNode = {
        type: "program",
        body: []
    };
    // let's build the body of the topmost node (programNode) first
    // the body will contain statements (groups of tokens)
    // first split the tokens with the semicolon token (leaving the semicolons out)
    var tokenGroup = [];
    var statements = []; // this will be a list of group of tokens, each group composing a statement.
    var counter = 0;
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
    function contains(listOfTokens, requiredType) {
        // returns index if token exists, otherwise -1
        for (var i = 0; i < listOfTokens.length; i++) {
            if (listOfTokens[i].type == requiredType)
                return i;
        }
        return -1;
    }
    // a function to parse each statement
    function parser(statement) {
        // we're having the tokens now.
        // we first check if stmnt has = in it
        var index = contains(statement, "assignment");
        if (index != -1) {
            // create an assignment node
            var assignmentNode = {
                type: "assignment",
                value: "=",
                left: parser(statement.slice(0, index)),
                right: parser(statement.slice(index + 1))
            };
            return assignmentNode;
        }
        // then we check for add/sub
        index = contains(statement, "addition");
        if (index != -1) {
            var additionNode = {
                type: "addition",
                value: "+",
                left: parser(statement.slice(0, index)),
                right: parser(statement.slice(index + 1))
            };
            return additionNode;
        }
        index = contains(statement, "subtraction");
        if (index != -1) {
            var subtractionNode = {
                type: "subtraction",
                value: "-",
                left: parser(statement.slice(0, index)),
                right: parser(statement.slice(index + 1))
            };
            return subtractionNode;
        }
        // nextup, check for declarations, identifiers, literals and print tokens
        // at this point, the token group should only have one token b/c the above 3 are our only binary operators
        if (statement.length > 1) {
            throw new Error("token group is expected to have 1 token only. but it has ".concat(statement.length));
        }
        var token = statement[0];
        // this token is returned as a node itself
        return token;
    }
    // at this point, the program body contains list of tokenGroups.
    // let's replace the tokenGropus with their corresponding nodes
    for (var i = 0; i < statements.length; i++) {
        programNode.body.push(parser(statements[i]));
    }
    // finally, return the program node
    return programNode;
}






//******************************THE REGISTER PROVIDER CLASS**************************/
var RegisterProvider = /** @class */ (function () {
    function RegisterProvider() {
        // this class gives new empty registers when asked and compromises by
        // recycling registers if required.
        this.currentSaved = 0; // the current available saved register number
        this.maxSaved = 8; // the maximum saved register number (7 for mips-32) +1 for modulp purposes
        this.currentTemp = 0; // the current available temporary register number
        this.maxTemp = 10; // the maximum temporary register number (9 for mips-32) +1 for modulo purposes
    }
    RegisterProvider.prototype.getSaved = function () {
        var num = this.currentSaved % this.maxSaved;
        this.currentSaved++;
        return "$s" + num;
    };
    RegisterProvider.prototype.getTemp = function () {
        var num = this.currentTemp % this.maxTemp;
        this.currentTemp++;
        return "$t" + num;
    };
    return RegisterProvider;
}());





// now create a singleton global registerProvider object
var registerProvider = new RegisterProvider();
var SymbolTable = /** @class */ (function () {
    function SymbolTable(regProv) {
        this.table = [];
        this.registerProvider = regProv;
    }
    SymbolTable.prototype.setSymbol = function (identifier, type) {
        // if symbol already exists, throw error (b/c we're trying to re-declare it)
        var i = 0;
        while (i < this.table.length) {
            if (this.table[i].name == identifier) {
                throw new Error("the identifier ".concat(identifier, " is already declared."));
            }
            i++;
        }
        // otherwise, create a symbol and set it. then return the new register
        var symbol = {
            name: identifier,
            register: this.registerProvider.getSaved(),
            type: type
        };
        this.table.push(symbol);
        return symbol.register;
    };
    SymbolTable.prototype.getSymbol = function (identifier) {
        // we return the symbol if it exists. otherwise, null
        var i = 0;
        while (i < this.table.length) {
            if (this.table[i].name == identifier) {
                return this.table[i];
            }
            i++;
        }
        return null;
    };
    return SymbolTable;
}());





// now create a singleton global symbolTable object
// and pass it the singleton global registerProvider so they get connected
var symbolTable = new SymbolTable(registerProvider);
/*************************** THE CODE GENERATOR **************************** */
function generator(programNode, symbolTable) {
    var outputString = "";
    // parse each root node in the programNode's body and append the resulting string to the output string
    for (var _i = 0, _a = programNode.body; _i < _a.length; _i++) {
        var node = _a[_i];
        generate(node);
    }
    function generate(node) {
        var _a;
        // check for declaration node
        if (node.type == "declaration") {
            // get the new identifier and add it to the symbol table, then return the new register.
            if (node.value.startsWith("int")) {
                var register = symbolTable.setSymbol(node.value.slice(3).trim(), "int");
                return register;
            }
            else if (node.value.startsWith("string")) {
                throw new Error("string features not implemented yet");
            }
            else {
                throw new Error("unknown type: ".concat(node.value));
            }
        }
        // checking for number literal
        if (node.type == "numberLiteral") {
            // get a temporary register, and return the register.
            // and uppend mips code to to move the literal into the temp register
            var register = symbolTable.registerProvider.getTemp();
            outputString += "li ".concat(register, ", ").concat(node.value, " \n");
            return register;
        }
        // checking for string literal
        if (node.type == "stringLiteral") {
            throw new Error("string features not implemented yet");
        }
        // checking for an identifier node
        if (node.type == "identifier") {
            // first get the symbol for the identifier or throw error if symbol doesn't exist
            var symbol = symbolTable.getSymbol(node.value);
            if (!symbol) {
                throw new Error("unknown identifier: ".concat(node.value));
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
            var leftRegister = generate(node.left);
            var rightRegister = generate(node.right);
            var tempRegister = symbolTable.registerProvider.getTemp();
            var opWord = node.type == "addition" ? "add" : "sub";
            outputString += "".concat(opWord, " ").concat(tempRegister, ", ").concat(leftRegister, ", ").concat(rightRegister, " \n");
            return tempRegister;
        }
        // check for print
        if (node.type == "print") {
            // printee is the value of the print token.
            // check if printee identifier and proceed
            var register = (_a = symbolTable.getSymbol(node.value)) === null || _a === void 0 ? void 0 : _a.register;
            if (register) { // printee is an identifier with type int
                // write the relevant mips to print the value of the identifier
                outputString += "li $v0, 1 \nmove $a0, ".concat(register, " \nsyscall \n");
                return;
            }
            else if (new RegExp("^[0-9]*$").test(node.value)) { // check if printee number literal and proceed
                outputString += "li $v0, 1 \nli $a0, ".concat(node.value, " \nsyscall");
                return;
            }
            else {
                // printee is neither an identifier nor a number literal. complain.
                throw new Error("invalid argument to a print statement.");
            }
        }
        // finally, check for assignment node
        if (node.type == "assignment") {
            // do some validations and throw relevant errors
            if (!["declaration", "identifier"].includes(node.left.type)) {
                throw new Error("wront usage of assignment (=) operator: = between ".concat(node.left.value, " and ").concat(node.right.value));
            }
            // now call generate on the two operands and get corresponding registers, then write
            // mips to move the value of the right register into the left register
            var leftRegister = generate(node.left);
            var rightRegister = generate(node.right);
            outputString += "move ".concat(leftRegister, ", ").concat(rightRegister, " \n");
        }
    }
    return outputString;
}




/*********************************** THE COMPILER ************************************* */
function compiler(dartCode) {
    // we need a global singleton symbol table
    var symbolTable = new SymbolTable(new RegisterProvider());
    var tokens = tokenizer(dartCode);
    var ast = getAST(tokens);
    var mipsCode = generator(ast, symbolTable);
    return mipsCode;
}