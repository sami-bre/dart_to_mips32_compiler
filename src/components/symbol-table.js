import { registerProvider } from "./register-provider";
export class SymbolTable {
    constructor(registerProvider) {
        this.table = [];
        this.registerProvider = registerProvider;
    }
    setSymbol(identifier, type) {
        for (const symbol of this.table) {
            if (symbol.name === identifier) {
                throw new Error(`The identifier ${identifier} is already declared.`);
            }
        }
        const symbol = {
            name: identifier,
            register: this.registerProvider.getSaved(),
            type: type,
        };
        this.table.push(symbol);
        return symbol.register;
    }
    getSymbol(identifier) {
        for (const symbol of this.table) {
            if (symbol.name === identifier) {
                return symbol;
            }
        }
        return null;
    }
}
export const symbolTable = new SymbolTable(registerProvider);
