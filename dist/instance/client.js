var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import HTTPClient from './httpclient';
import Session from './session';
class Client {
    // Args:
    // target (string): the device url
    // If target is None, set to "http://localhost:8100"
    constructor(url = 'http://localhost:8100') {
        this.http = new HTTPClient(url);
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.http.fetch('get', 'status');
            return res;
        });
    }
    home() {
        return __awaiter(this, void 0, void 0, function* () {
            // Press home button
            return yield this.http.fetch('post', '/wda/homescreen');
        });
    }
    healthcheck() {
        return __awaiter(this, void 0, void 0, function* () {
            // Hit healthcheck
            return yield this.http.fetch('get', '/wda/healthcheck');
        });
    }
    source(format = 'xml', accessible = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // Args:
            //   format (str): only 'xml' and 'json' source types are supported
            //   accessible (bool): when set to true, format is always 'json'
            let res;
            if (accessible) {
                res = yield this.http.fetch('get', '/wda/accessibleSource');
            }
            else {
                res = yield this.http.fetch('get', 'source?format=' + format);
            }
            return res.value;
        });
    }
    session(bundleId, args, environment) {
        return __awaiter(this, void 0, void 0, function* () {
            // Args:
            //     - bundle_id (str): the app bundle id
            //     - arguments (list): ['-u', 'https://www.google.com/ncr']
            //     - enviroment (dict): {"KEY": "VAL"}
            // WDA Return json like
            // {
            //     "value": {
            //         "sessionId": "69E6FDBA-8D59-4349-B7DE-A9CA41A97814",
            //         "capabilities": {
            //             "device": "iphone",
            //             "browserName": "部落冲突",
            //             "sdkVersion": "9.3.2",
            //             "CFBundleIdentifier": "com.supercell.magic"
            //         }
            //     },
            //     "sessionId": "69E6FDBA-8D59-4349-B7DE-A9CA41A97814",
            //     "status": 0
            // }
            // To create a new session, send json data like
            // {
            //     "desiredCapabilities": {
            //         "bundleId": "your-bundle-id",
            //         "app": "your-app-path"
            //         "shouldUseCompactResponses": (bool),
            //         "shouldUseTestManagerForVisibilityDetection": (bool),
            //         "maxTypingFrequency": (integer),
            //         "arguments": (list(str)),
            //         "environment": (dict: str->str)
            //     },
            // }
            if (!bundleId) {
                const status = yield this.status();
                const sid = status['sessionId'];
                if (!sid) {
                    throw 'no session created ever';
                }
                const http = this.http.newClient('session/' + sid);
                const value = yield http.fetch('get', '/');
                return yield new Session(http, value);
            }
            if (!Array.isArray(args)) {
                throw 'arguments must be a array';
            }
            if (typeof environment !== 'object') {
                throw 'environment must be a object';
            }
            const capabilities = {
                bundleId,
                arguments: args,
                environment,
                shouldWaitForQuiescence: true,
            };
            const data = {
                desiredCapabilities: capabilities
            };
            const res = yield this.http.fetch('post', 'session', data);
            const httpclient = this.http.newClient('session/' + res.sessionId);
            const value = yield httpclient.fetch('get', '/');
            return new Session(httpclient, value);
        });
    }
}
export default Client;
//# sourceMappingURL=client.js.map