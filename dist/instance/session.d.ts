import HTTPClient from './httpclient';
import Alert from './alert';
declare class Session {
    http: HTTPClient;
    capabilities: any;
    alertCallback: Function;
    private sid;
    /**
     * @param httpclient HTTPClient
     * @param value get status object
     */
    constructor(httpclient: HTTPClient, value: any);
    protected id(): string;
    protected bundleId(): any;
    /**
     * @param callback called when alert popup
     */
    setAlertCallback(callback: Function): void;
    /**
     * TODO: Never successed using before.
     * https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBSessionCommands.m#L43
     *
     * @param url string
     */
    openUrl(url: string): Promise<any>;
    /**
     * @param duration deactivate time, seconds
     */
    deactivate(duration: number): Promise<any>;
    tap(x: number, y: number): Promise<any>;
    doubleTap(x: number, y: number): Promise<any>;
    /**
     * Tap and hold for a moment
     * @param x position x
     * @param y position y
     * @param duration seconds of hold time
     *
     * [[FBRoute POST:@"/wda/touchAndHold"] respondWithTarget:self action:@selector(handleTouchAndHoldCoordinate:)]
     */
    tapHold(x: number, y: number, duration: number): Promise<any>;
    /**
     *
     * @param fromX position fromX
     * @param fromY position fromY
     * @param toX position toX
     * @param toY position toY
     * @param duration start coordinate press duration (seconds)
     *
     * [[FBRoute POST:@"/wda/dragfromtoforduration"] respondWithTarget:self action:@selector(handleDragCoordinate:)]
     */
    swipe(fromX: number, fromY: number, toX: number, toY: number, duration?: number): Promise<any>;
    swipeLeft(): Promise<any>;
    swipeRight(): Promise<any>;
    swipeUp(): Promise<any>;
    swipeDown(): Promise<any>;
    alert(): Alert;
    close(): Promise<any>;
    /**
     * get window size
     */
    private getWindowSize();
}
export default Session;
