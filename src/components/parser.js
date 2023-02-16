export function getAST(tokens) {
    const programNode = {
        type: "program",
        body: [],
    };
    let tokenGroup = [];
    let statements = [];
    for (const token of tokens) {
        if (token.type === "semicolon") {
            statements.push(tokenGroup);
            tokenGroup = [];
        }
        else {
            tokenGroup.push(token);
        }
    }
    if (tokenGroup.length > 0) {
        throw new Error("There is a missing semicolon after the last statement");
    }
    function contains(listOfTokens, requiredType) {
        return listOfTokens.findIndex((token) => token.type === requiredType);
    }
    function parseStatement(statement) {
        const assignmentIndex = contains(statement, "assignment");
        if (assignmentIndex !== -1) {
            return {
                type: "assignment",
                value: "=",
                left: parseStatement(statement.slice(0, assignmentIndex)),
                right: parseStatement(statement.slice(assignmentIndex + 1)),
            };
        }
        const additionIndex = contains(statement, "addition");
        if (additionIndex !== -1) {
            return {
                type: "addition",
                value: "+",
                left: parseStatement(statement.slice(0, additionIndex)),
                right: parseStatement(statement.slice(additionIndex + 1)),
            };
        }
        const subtractionIndex = contains(statement, "subtraction");
        if (subtractionIndex !== -1) {
            return {
                type: "subtraction",
                value: "-",
                left: parseStatement(statement.slice(0, subtractionIndex)),
                right: parseStatement(statement.slice(subtractionIndex + 1)),
            };
        }
        if (statement.length !== 1) {
            throw new Error(`Token group is expected to have 1 token only, but it has ${statement.length}`);
        }
        const token = statement[0];
        return {
            type: token.type,
            value: token.value,
        };
    }
    for (const statement of statements) {
        programNode.body.push(parseStatement(statement));
    }
    return programNode;
}
