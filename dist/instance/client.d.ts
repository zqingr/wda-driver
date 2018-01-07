import HTTPClient from './httpclient';
import Session from './session';
declare class Client {
    http: HTTPClient;
    constructor(url?: string);
    status(): Promise<any>;
    home(): Promise<any>;
    healthcheck(): Promise<any>;
    source(format?: 'xml' | 'json', accessible?: boolean): Promise<any>;
    session(bundleId?: string, args?: string[], environment?: any): Promise<Session>;
    /**
     * Screenshot with PNG format
     *
     * @param pngFilename optional, save file name
     * @return png raw data
     */
    screenshot(pngFilename?: string): Promise<any>;
}
export default Client;
