declare class HTTPClient {
    address: string;
    alertCallback: Function | undefined;
    constructor(address: string, alertCallback?: Function);
    newClient(path: string): HTTPClient;
    fetch(method: string, url: string, data?: any): Promise<any>;
    protected fetchNoAlert(method: string, queryUrl: string, data?: any, depth?: number): Promise<any>;
}
export default HTTPClient;
