"use strict";
//***********************************THE TOKENIZER*********************************** */
exports.__esModule = true;
exports.SymbolTable = exports.RegisterProvider = exports.getAST = exports.tokenizer = void 0;
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
exports.tokenizer = tokenizer;
//*************************************THE PARSER************************************* */
function getAST(tokens) {
    var programNode = {
        type: "program",
        body: []
    };
    // let's build the body of the topmost node (programNode) first
    // the body will contain statements (groups of tokens)
    // first split the tokens with the semicolon token (leaving the semicolons out)
    var tokenGroup = [];
    var counter = 0;
    while (counter < tokens.length) {
        if (tokens[counter].type == "semicolon") {
            // we push what we have in the token group to the program body
            programNode.body.push(tokenGroup);
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
        // nextup, check for declarations, identifiers and literals
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
    for (var i = 0; i < programNode.body.length; i++) {
        programNode.body[i] = parser(programNode.body[i]);
    }
    // finally, return the program node
    return programNode;
}
exports.getAST = getAST;
//***********************THE REGISTER PROVIDER CLASS****************/
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
exports.RegisterProvider = RegisterProvider;
var SymbolTable = /** @class */ (function () {
    function SymbolTable() {
        this.table = [];
    }
    SymbolTable.prototype.setSymbol = function (symbol) {
        // if symbol already exists, throw error (b/c we're trying to re-declare it)
        var i = 0;
        while (i < this.table.length) {
            if (this.table[i].identifier == symbol.identifier) {
                throw new Error("the identifier ".concat(symbol.identifier, " is already declared."));
            }
        }
        // otherwise, set it
        this.table.push(symbol);
    };
    SymbolTable.prototype.getSymbol = function (identifier) {
        // we return the symbol if it exists. otherwise, null
        var i = 0;
        while (i < this.table.length) {
            if (this.table[i].identifier == identifier) {
                return this.table[i];
            }
        }
        return null;
    };
    return SymbolTable;
}());
exports.SymbolTable = SymbolTable;
