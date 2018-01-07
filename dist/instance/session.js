var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Session {
    constructor(httpclient, value) {
        // Args:
        //   - httpclient(HTTPClient)
        //   - session_id(string): wda session id
        this.http = httpclient;
        // Example session value
        // "capabilities": {
        //     "CFBundleIdentifier": "com.netease.aabbcc",
        //     "browserName": "?????",
        //     "device": "iphone",
        //     "sdkVersion": "10.2"
        // }
        this.capabilities = value.capabilities;
        this.sid = value.sessionId;
    }
    id() {
        return this.sid;
    }
    bundleId() {
        // the session matched bundle id
        return this.capabilities.CFBundleIdentifier;
    }
    setAlertCallback(callback) {
        // Args:
        // callback (func): called when alert popup
        // Example of callback:
        //     def callback(session):
        //         session.alert.accept()
        this.alertCallback = callback;
    }
    openUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Never successed using before.
            // https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBSessionCommands.m#L43
            // Args:
            //     url (str): url
            // Raises:
            //     WDAError
            return yield this.http.fetch('post', 'url', { 'url': url });
        });
    }
    deactivate(duration) {
        // Args:
        //  - duration (number): deactivate time, seconds
        return this.http.fetch('post', '/wda/deactivateApp', { duration });
    }
    tap(x, y) {
        return this.http.fetch('post', '/wda/tap/0', { x, y });
    }
}
export default Session;
//# sourceMappingURL=session.js.map