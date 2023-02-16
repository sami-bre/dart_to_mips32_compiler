import { registerProvider, RegisterProvider } from "./register-provider";

export interface Symbol {
    name: string;
    register: string;
    type: 'int' | 'string';
}

export class SymbolTable {
    private table: Symbol[] = [];
    public registerProvider: RegisterProvider;

    constructor(registerProvider: RegisterProvider) {
        this.registerProvider = registerProvider;
    }

    public setSymbol(identifier: string, type: 'int' | 'string'): string {
        for (const symbol of this.table) {
            if (symbol.name === identifier) {
                throw new Error(`The identifier ${identifier} is already declared.`);
            }
        }

        const symbol: Symbol = {
            name: identifier,
            register: this.registerProvider.getSaved(),
            type: type,
        };

        this.table.push(symbol);
        return symbol.register;

    }

    public getSymbol(identifier: string): Symbol | null {
        for (const symbol of this.table) {
            if (symbol.name === identifier) {
                return symbol;
            }
        }

        return null;

    }
}

export const symbolTable = new SymbolTable(registerProvider);
