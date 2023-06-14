export class Logger {
    private ns: string;

    constructor(ns: string) {
        this.ns = ns;
    }

    info = (message?: any, ...optionalParams: any[]) => {
        console.log(this.ns + ': ' + message + ' ', optionalParams);
    };

    warning = (message?: any, ...optionalParams: any[]) => {
        console.warn(this.ns + ': ' + message + ' ', optionalParams);
    };

    error = (message?: any, ...optionalParams: any[]) => {
        console.error(this.ns + ': ' + message + ' ', optionalParams);
    };

    debug = (message?: any, ...optionalParams: any[]) => {
        console.debug(this.ns + ': ' + message + ' ', optionalParams);
    };
}
