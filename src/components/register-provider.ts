export class RegisterProvider {
    private currentSaved = 0; // the current available saved register number
    private maxSaved = 8; // the maximum saved register number (7 for mips-32) +1 for module purposes
    private currentTemp = 0; // the current available temporary register number
    private maxTemp = 10; // the maximum temporary register number (9 for mips-32) +1 for module purposes

    getSaved(): string {
        const num = this.currentSaved % this.maxSaved;
        this.currentSaved++;
        return `$s${num}`;
    }

    getTemp(): string {
        const num = this.currentTemp % this.maxTemp;
        this.currentTemp++;
        return `$t${num}`;
    }
}

// Singleton global registerProvider object
export const registerProvider = new RegisterProvider();