export function generate(programNode, symbolTable) {
    let outputString = "";
    function generateNode(node) {
        switch (node.type) {
            case "declaration": {
                return generateDeclaration(node);
            }
            case "numberLiteral": {
                return generateNumberLiteral(node);
            }
            case "stringLiteral": {
                return generateStringLiteral(node);
            }
            case "identifier": {
                return generateIdentifier(node, symbolTable);
            }
            case "addition":
            case "subtraction": {
                return generateArithmetic(node, symbolTable);
            }
            case "assignment": {
                return generateAssignment(node, symbolTable);
            }
            default: {
                throw new Error(`Unknown node type: ${node.type}`);
            }
        }
    }
    function generateDeclaration(node) {
        if (node.value.startsWith("int")) {
            const register = symbolTable.setSymbol(node.value.slice(3).trim(), "int");
            return register;
        }
        else if (node.value.startsWith("string")) {
            throw new Error(`string features not implemented yet`);
        }
        else {
            throw new Error(`Unknown type: ${node.value}`);
        }
    }
    function generateNumberLiteral(node) {
        const register = symbolTable.registerProvider.getTemp();
        outputString += `li ${register}, ${node.value} \n`;
        return register;
    }
    function generateStringLiteral(node) {
        throw new Error(`string features not implemented yet`);
    }
    function generateIdentifier(node, symbolTable) {
        const symbol = symbolTable.getSymbol(node.value);
        if (!symbol) {
            throw new Error(`Unknown identifier: ${node.value}`);
        }
        if (symbol.type === "string") {
            throw new Error(`string features not implemented yet`);
        }
        return symbol.register;
    }
    function generateArithmetic(node, symbolTable) {
        const leftRegister = generateNode(node.left);
        const rightRegister = generateNode(node.right);
        const tempRegister = symbolTable.registerProvider.getTemp();
        const opWord = node.type === "addition" ? "add" : "sub";
        outputString += `${opWord} ${tempRegister}, ${leftRegister}, ${rightRegister} \n`;
        return tempRegister;
    }
    function generateAssignment(node, symbolTable) {
        if (!["declaration", "identifier"].includes(node.left.type)) {
            throw new Error(`Wrong usage of assignment(=) operator: = between ${node.left.value} and ${node.right.value}`);
        }
        const leftRegister = generateNode(node.left);
        const rightRegister = generateNode(node.right);
        outputString += `move ${leftRegister}, ${rightRegister} \n`;
    }
    programNode.body.forEach((node) => {
        const nodeOutput = generateNode(node);
        if (nodeOutput) {
            outputString += nodeOutput;
        }
    });
    return outputString;
}
