import Session from './session';
import HTTPClient from './httpclient';
declare class Alert {
    s: Session;
    http: HTTPClient;
    constructor(session: Session);
    private exists();
    private text();
    wait(timeout?: number): Promise<boolean>;
    accept(): Promise<any>;
    dismiss(): Promise<any>;
    buttons(): Promise<any>;
    /**
     * @param name the name of the button
     */
    click(name: string): Promise<any>;
}
export default Alert;
