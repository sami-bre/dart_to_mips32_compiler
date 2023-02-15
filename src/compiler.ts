export function tokenizer(dartString: string): {type: String, value: String}[] {
    let tokens: {type: String, value: String}[] = []
    let current = 0 // used to track where we are in the program string
    
    while(current < dartString.length) {
        if(dartString[current] == ';'){     // semicolon is a token
            tokens.push({type: "semicolon", value: ';'})
            current++;
            continue
        } else if(dartString[current] == "=") { // the equal sign is a token
            tokens.push({type: "assignment", value: "="})
            current++
        } else if(dartString.startsWith("int", current)) {   // 'int myNumber' is a token
            // we have an integer variable decleration
            let tokenValue = "int "
            current += 4
            // let's skip some speces, should they exist
            while(dartString[current] == ' ') current++
            while(!([' ', ';', '='].includes(dartString[current]))) {
                tokenValue += dartString[current]
                current++
            }
            tokens.push({type: "delaration", value: tokenValue})
        } else if(['"', "'"].includes(dartString[current])){   // strings are tokens
            throw new Error("not implemented")
        } else if(new RegExp('^[0-9]$').test(dartString[current])) {   // numbers are tokens, like 325
            let tokenValue = ''
            while(new RegExp('^[0-9]$').test(dartString[current])) {
                tokenValue += dartString[current]
                current++
            }
            tokens.push({type: "numberLiteral", value: tokenValue})
        } else if(dartString[current] == '+') {   // the add symbol is a token
            tokens.push({type: "addition", value: "+"})
            current++
        } else if(dartString[current] == '-') {
            tokens.push({type: "subtraction", value: "-"})
            current++
        } else if(dartString[current] == "*") {     // multiply sign is a token
            throw new Error("not implemented")
        } else if(dartString[current] == "/") {
            throw new Error("not implemented")
        } else if(dartString[current] == ' ') {     // we want to skip spaces
            current++
            continue
        } else if(new RegExp('[a-zA-Z]').test(dartString[current])){  // identifiers start with a letter
            let tokenValue = ''
            while(new RegExp('^[a-zA-Z0-9_-]*$').test(dartString[current])){
                tokenValue += dartString[current];
                current++
            }
            tokens.push({type: "identifier", value: tokenValue})
        } else {    // if all fails, throw an error
            throw new Error(`unknown token at position ${current}`)
        }

    }

    return tokens
}
