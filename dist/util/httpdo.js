var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sleep from '../util/sleep';
import rp from 'request-promise';
function httpdo(url, method = 'GET', payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = new Date().getTime();
        const data = JSON.stringify(payload);
        const options = {
            uri: url,
            method,
            body: data,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };
        // Do HTTP Request
        console.log(`Shell: curl -X ${method} -d '${data}' '${url}'`);
        let res;
        try {
            res = yield rp(options);
        }
        catch (e) {
            console.log(`retry to connect, error: ${e}`);
            yield sleep(1000);
            res = yield rp(options);
        }
        const retjson = res;
        console.log(`Return {{${new Date().getTime() - startTime}ms}}`, retjson);
        return retjson;
    });
}
export default httpdo;
//# sourceMappingURL=httpdo.js.map