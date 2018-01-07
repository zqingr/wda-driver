var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import httpdo from '../util/httpdo';
import * as url from 'url';
class HTTPClient {
    constructor(address, alertCallback) {
        this.address = address;
        this.alertCallback = alertCallback;
    }
    newClient(path) {
        return new HTTPClient(url.resolve(this.address, path), this.alertCallback);
    }
    fetch(method, url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchNoAlert(method, url, data);
        });
    }
    fetchNoAlert(method, queryUrl, data, depth) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetUrl = url.resolve(this.address, queryUrl);
            try {
                return yield httpdo(targetUrl, method, data);
            }
            catch (e) {
                if (depth && depth >= 10) {
                    return Promise.reject(e);
                }
                this.alertCallback && this.alertCallback();
                return yield this.fetchNoAlert(method, queryUrl, data, (depth || 0) + 1);
            }
        });
    }
}
export default HTTPClient;
//# sourceMappingURL=httpclient.js.map