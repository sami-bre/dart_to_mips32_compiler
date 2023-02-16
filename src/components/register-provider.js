export class RegisterProvider {
    constructor() {
        this.currentSaved = 0; // the current available saved register number
        this.maxSaved = 8; // the maximum saved register number (7 for mips-32) +1 for module purposes
        this.currentTemp = 0; // the current available temporary register number
        this.maxTemp = 10; // the maximum temporary register number (9 for mips-32) +1 for module purposes
    }
    getSaved() {
        const num = this.currentSaved % this.maxSaved;
        this.currentSaved++;
        return `$s${num}`;
    }
    getTemp() {
        const num = this.currentTemp % this.maxTemp;
        this.currentTemp++;
        return `$t${num}`;
    }
}
// Singleton global registerProvider object
export const registerProvider = new RegisterProvider();
