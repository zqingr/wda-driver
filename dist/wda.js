'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rp = _interopDefault(require('request-promise'));
var fs = _interopDefault(require('fs'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */













function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function sleep(time) {
    return new Promise((reslove) => {
        setTimeout(() => {
            reslove();
        }, time);
    });
}

function httpdo(url, method = 'GET', payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // const startTime = new Date().getTime()
        const options = {
            uri: url,
            method,
            body: payload,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };
        // Do HTTP Request
        // console.log(`Shell: curl -X ${method} -d '${payload}' '${url}'`)
        let res;
        try {
            res = yield rp(options);
        }
        catch (e) {
            // console.log(`retry to connect, error: ${e}`)
            yield sleep(1000);
            res = yield rp(options);
        }
        const retjson = res;
        // console.log(`Return {{${new Date().getTime() - startTime}ms}}`, retjson)
        return retjson;
    });
}

const urljoin = require('url-join');
class HTTPClient {
    constructor(address, alertCallback) {
        this.address = address;
        this.alertCallback = alertCallback;
    }
    newClient(path) {
        return new HTTPClient(urljoin(this.address, path), this.alertCallback);
    }
    fetch(method, url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchNoAlert(method, url, data);
        });
    }
    fetchNoAlert(method, queryUrl, data, depth) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetUrl = urljoin(this.address, queryUrl);
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

class Alert {
    constructor(session) {
        this.s = session;
        this.http = session.http;
    }
    exists() {
        return __awaiter(this, void 0, void 0, function* () {
            let text;
            try {
                text = yield this.text();
            }
            catch (e) {
                return false;
            }
            return !!text;
        });
    }
    text() {
        return __awaiter(this, void 0, void 0, function* () {
            const { value } = yield this.http.fetch('get', '/alert/text');
            return typeof value === 'string' ? value : '';
        });
    }
    wait(timeout = 20) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = new Date().getTime();
            while (new Date().getTime() - startTime < (timeout * 1000)) {
                if (yield this.exists()) {
                    return true;
                }
                yield sleep(20);
            }
            return false;
        });
    }
    accept() {
        return this.http.fetch('post', '/alert/accept');
    }
    dismiss() {
        return this.http.fetch('post', '/alert/dismiss');
    }
    buttons() {
        return __awaiter(this, void 0, void 0, function* () {
            const { value } = yield this.http.fetch('get', '/wda/alert/buttons');
            return value;
        });
    }
    /**
     * @param name the name of the button
     */
    click(name) {
        return this.http.fetch('post', '/alert/accept', { name });
    }
}

const ELEMENTS = [
    'Any',
    'Other',
    'Application',
    'Group',
    'Window',
    'Sheet',
    'Drawer',
    'Alert',
    'Dialog',
    'Button',
    'RadioButton',
    'RadioGroup',
    'CheckBox',
    'DisclosureTriangle',
    'PopUpButton',
    'ComboBox',
    'MenuButton',
    'ToolbarButton',
    'Popover',
    'Keyboard',
    'Key',
    'NavigationBar',
    'TabBar',
    'TabGroup',
    'Toolbar',
    'StatusBar',
    'Table',
    'TableRow',
    'TableColumn',
    'Outline',
    'OutlineRow',
    'Browser',
    'CollectionView',
    'Slider',
    'PageIndicator',
    'ProgressIndicator',
    'ActivityIndicator',
    'SegmentedControl',
    'Picker',
    'PickerWheel',
    'Switch',
    'Toggle',
    'Link',
    'Image',
    'Icon',
    'SearchField',
    'ScrollView',
    'ScrollBar',
    'StaticText',
    'TextField',
    'SecureTextField',
    'DatePicker',
    'TextView',
    'Menu',
    'MenuItem',
    'MenuBar',
    'MenuBarItem',
    'Map',
    'WebView',
    'IncrementArrow',
    'DecrementArrow',
    'Timeline',
    'RatingIndicator',
    'ValueIndicator',
    'SplitGroup',
    'Splitter',
    'RelevanceIndicator',
    'ColorWell',
    'HelpTag',
    'Matte',
    'DockItem',
    'Ruler',
    'RulerMarker',
    'Grid',
    'LevelIndicator',
    'Cell',
    'LayoutArea',
    'LayoutItem',
    'Handle',
    'Stepper',
    'Tab'
];

class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    getCenter() {
        const [x, y] = [this.x + this.width / 2, this.y + this.height / 2];
        return [x, y];
    }
    getOrigin() {
        const { x, y } = this;
        return [x, y];
    }
    getLeft() {
        return this.x;
    }
    getTop() {
        return this.y;
    }
    getRight() {
        return this.x + this.width;
    }
    getBottom() {
        return this.y + this.height;
    }
}

class Element {
    constructor(httpclient, id) {
        this.http = httpclient;
        this.id = id;
    }
    req(method, url, data) {
        return this.http.fetch(method, '/element/' + this.id + url, data);
    }
    wdaReq(method, url, data) {
        return this.http.fetch(method, '/wda/element/' + this.id + url, data);
    }
    prop(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const { value } = yield this.req('get', '/' + key.replace(/\/$/, ''));
            return value;
        });
    }
    wdaProp(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const { value } = yield this.wdaReq('get', '/' + key.replace(/\/$/, ''));
            return value;
        });
    }
    getId() {
        return this.id;
    }
    getLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prop('attribute/label');
        });
    }
    getClassName() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prop('attribute/type');
        });
    }
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prop('text');
        });
    }
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prop('name');
        });
    }
    getDisplayed() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prop('displayed');
        });
    }
    getEnabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prop('enabled');
        });
    }
    getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prop('value');
        });
    }
    getVisible() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prop('visible');
        });
    }
    getBounds() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.prop('rect');
            const { x, y, width: w, height: h } = value;
            return new Rect(x, y, w, h);
        });
    }
    getAccessible() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.wdaProp('accessible');
        });
    }
    getAccessibilityContainer() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.wdaProp('accessibilityContainer');
        });
    }
    // operations
    tap() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.req('post', '/click');
        });
    }
    click() {
        return __awaiter(this, void 0, void 0, function* () {
            // Alias of tap
            return yield this.tap();
        });
    }
    /** Tap and hold for a moment
     * @param duration seconds of hold time
     * [[FBRoute POST:@"/wda/element/:uuid/touchAndHold"] respondWithTarget:self action:@selector(handleTouchAndHold:)]
     */
    tapHold(duration = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.wdaReq('post', '/touchAndHold', { 'duration': duration });
        });
    }
    /**
     *
     * @param direction one of "visible", "up", "down", "left", "right"
     * @param distance swipe distance, only works when direction is not "visible"
     *
     * distance=1.0 means, element (width or height) multiply 1.0
     */
    scroll(direction = 'visible', distance = 1.0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (direction === "visible") {
                return yield this.wdaReq('post', '/scroll', { 'toVisible': true });
            }
            else if (['up', 'down', 'left', 'right'].indexOf(direction) > -1) {
                return yield this.wdaReq('post', '/scroll', { 'direction': direction, 'distance': distance });
            }
            else {
                throw "Invalid direction";
            }
        });
    }
    /**
     *
     * @param scale scale must > 0
     * @param velocity velocity must be less than zero when scale is less than 1
     * Example:
              pinchIn  -> scale:0.5, velocity: -1
              pinchOut -> scale:2.0, velocity: 1
     */
    pinch(scale, velocity) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.wdaReq('post', '/pinch', { scale, velocity });
        });
    }
    setText(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.req('post', '/value', { 'value': value });
        });
    }
    clearText() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.req('post', '/clear');
        });
    }
}

class Selector {
    // WDA use two key to find elements "using", "value"
    // Examples:
    // "using" can be on of 
    //     "partial link text", "link text"
    //     "name", "id", "accessibility id"
    //     "class name", "class chain", "xpath", "predicate string"
    // predicate string support many keys
    //     UID,
    //     accessibilityContainer,
    //     accessible,
    //     enabled,
    //     frame,
    //     label,
    //     name,
    //     rect,
    //     type,
    //     value,
    //     visible,
    //     wdAccessibilityContainer,
    //     wdAccessible,
    //     wdEnabled,
    //     wdFrame,
    //     wdLabel,
    //     wdName,
    //     wdRect,
    //     wdType,
    //     wdUID,
    //     wdValue,
    //     wdVisible
    constructor(httpclient, session, selectorObj) {
        this.http = httpclient;
        this.session = session;
        this.predicate = selectorObj.predicate;
        this.id = selectorObj.id;
        this.className = selectorObj.className || selectorObj.type;
        this.name = this.addEscapeCharacterForQuotePrimeCharacter(selectorObj.name || selectorObj.text);
        this.namePart = selectorObj.nameContains || selectorObj.textContains;
        this.nameRegex = selectorObj.nameMatches || selectorObj.textMatches;
        this.value = selectorObj.value;
        this.valuePart = selectorObj.valueContains;
        this.label = selectorObj.label;
        this.labelPart = selectorObj.labelContains;
        this.enabled = selectorObj.enabled;
        this.visible = selectorObj.visible;
        this.index = selectorObj.index || 0;
        this.xpath = this.fixXcuiType(selectorObj.xpath);
        this.classChain = this.fixXcuiType(selectorObj.classChain);
        this.timeout = selectorObj.timeout || 10;
        this.parentClassChains = selectorObj.parentClassChains || [];
        // some fixtures
        if (this.className && !this.className.startsWith('XCUIElementType')) {
            this.className = 'XCUIElementType' + this.className;
        }
        if (this.nameRegex) {
            if (!this.nameRegex.startsWith('^') && this.nameRegex.startsWith('.*')) {
                this.nameRegex = '.*' + this.nameRegex;
            }
            if (!this.nameRegex.endsWith('$') && !this.nameRegex.endsWith('.*')) {
                this.nameRegex = this.nameRegex + '.*';
            }
        }
    }
    /**
     * Fix for https://github.com/openatx/facebook-wda/issues/33
     *
     * @param v
     * @return string with properly formated quotes, or non changed text
     */
    addEscapeCharacterForQuotePrimeCharacter(text = '') {
        return text.replace("'", "\\'").replace('"', '\\"');
    }
    fixXcuiType(s) {
        if (!s)
            return '';
        const reElement = ELEMENTS.join('|');
        return s.replace(new RegExp("(" + reElement + ")"), a => 'XCUIElementType' + a);
    }
    /**
      HTTP example response:
      [
          {"ELEMENT": "E2FF5B2A-DBDF-4E67-9179-91609480D80A"},
          {"ELEMENT": "597B1A1E-70B9-4CBE-ACAD-40943B0A6034"}
      ]
     */
    wdasearch(using, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const elementIds = [];
            let { value: data } = yield this.http.fetch('post', '/elements', { using, value });
            data = typeof data === 'string' ? [] : data;
            data.forEach((d) => {
                elementIds.push(d['ELEMENT']);
            });
            return elementIds;
        });
    }
    // just return if aleady exists predicate
    genClassChain() {
        if (this.predicate) {
            return '/XCUIElementTypeAny[`' + this.predicate + '`]';
        }
        const qs = [];
        if (this.name) {
            qs.push(`name == '${this.name}'`);
        }
        if (this.namePart) {
            qs.push(`name CONTAINS '${this.namePart}'`);
        }
        if (this.nameRegex) {
            qs.push(`name MATCHES '${this.nameRegex}'`);
        }
        if (this.label) {
            qs.push(`label == '${this.label}'`);
        }
        if (this.labelPart) {
            qs.push(`label CONTAINS '${this.labelPart}'`);
        }
        if (this.value) {
            qs.push(`value == '${this.value}'`);
        }
        if (this.valuePart) {
            qs.push(`value CONTAINS ’${this.valuePart}'`);
        }
        if (this.visible !== null && this.visible !== undefined) {
            qs.push(`visible == ${this.visible.toString()}`);
        }
        if (this.enabled !== null && this.enabled !== undefined) {
            qs.push(`enabled == ${this.enabled.toString()}`);
        }
        const predicate = qs.join(' AND ');
        let chain = '/' + (this.className || 'XCUIElementTypeAny');
        if (predicate) {
            chain = chain + '[`' + predicate + '`]';
        }
        if (this.index) {
            chain = chain + `[${this.index}]`;
        }
        return chain;
    }
    findElementIds() {
        if (this.id)
            return this.wdasearch('id', this.id);
        if (this.predicate)
            return this.wdasearch('predicate string', this.predicate);
        if (this.xpath)
            return this.wdasearch('xpath', this.xpath);
        if (this.classChain)
            return this.wdasearch('class chain', this.classChain);
        const chain = '**' + this.parentClassChains.join() + this.genClassChain();
        return this.wdasearch('class chain', chain);
    }
    // return Element (list): all the elements
    findElements() {
        return __awaiter(this, void 0, void 0, function* () {
            const es = [];
            const ids = yield this.findElementIds();
            ids.forEach(id => {
                const e = new Element(this.http.newClient(''), id);
                es.push(e);
            });
            return es;
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            const ids = yield this.findElementIds();
            return ids.length;
        });
    }
    /**
     *
     * @param timeout timeout for query element, unit seconds Default 10s
     * @return Element: UI Element
     */
    get(timeout = this.timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = new Date().getTime();
            while (true) {
                const elems = yield this.findElements();
                if (elems.length > 0) {
                    return elems[0];
                }
                if (startTime + (timeout * 1000) < new Date().getTime()) {
                    break;
                }
                yield sleep(10);
            }
            // check alert again
            const exists = yield this.session.alert().exists();
            if (exists && this.http.alertCallback) {
                this.http.alertCallback();
                return yield this.get(timeout);
            }
            return Promise.reject([]);
        });
    }
    // Set element wait timeout
    setTimeout(s) {
        this.timeout = s;
        return this;
    }
    child(selectorObj) {
        const chain = this.genClassChain();
        selectorObj['parentClassChains'] = this.parentClassChains.concat([chain]);
        return new Selector(this.http, this.session, selectorObj);
    }
    exists() {
        return __awaiter(this, void 0, void 0, function* () {
            const ids = yield this.findElementIds();
            return ids.length > this.index;
        });
    }
    /**
     * Wait element and perform click
     * @param timeout timeout for wait
     * @returns bool: if successfully clicked
     */
    clickExists(timeout = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let e;
            try {
                e = yield this.get(timeout);
            }
            catch (e) {
                return false;
            }
            yield e.click();
            return true;
        });
    }
    /**
     * alias of get
     * @param timeout timeout seconds
     */
    wait(timeout = this.timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.get(timeout);
        });
    }
    waitGone(timeout = this.timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = new Date().getTime();
            while (startTime + (timeout * 1000) > new Date().getTime()) {
                if (!(yield this.exists())) {
                    return true;
                }
            }
            return false;
        });
    }
}

class Session {
    /**
     * @param httpclient HTTPClient
     * @param value get status object
     */
    constructor(httpclient, value) {
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
    getId() {
        return this.sid;
    }
    // the session matched bundle id
    getBundleId() {
        return this.capabilities.CFBundleIdentifier;
    }
    /**
     * @param callback called when alert popup
     */
    setAlertCallback(callback) {
        this.alertCallback = callback;
    }
    /**
     * TODO: Never successed using before.
     * https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBSessionCommands.m#L43
     *
     * @param url string
     */
    openUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.http.fetch('post', 'url', { 'url': url });
        });
    }
    /**
     * @param duration deactivate time, seconds
     */
    deactivate(duration) {
        return this.http.fetch('post', '/wda/deactivateApp', { duration });
    }
    tap(x, y) {
        return this.http.fetch('post', '/wda/tap/0', { x, y });
    }
    doubleTap(x, y) {
        return this.http.fetch('post', '/wda/doubleTap', { x, y });
    }
    /**
     * Tap and hold for a moment
     * @param x position x
     * @param y position y
     * @param duration seconds of hold time
     *
     * [[FBRoute POST:@"/wda/touchAndHold"] respondWithTarget:self action:@selector(handleTouchAndHoldCoordinate:)]
     */
    tapHold(x, y, duration) {
        return this.http.fetch('post', '/wda/touchAndHold', { x, y, duration });
    }
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
    swipe(fromX, fromY, toX, toY, duration = 0) {
        return this.http.fetch('post', '/wda/dragfromtoforduration', { fromX, fromY, toX, toY, duration });
    }
    swipeLeft() {
        return __awaiter(this, void 0, void 0, function* () {
            const { width, height } = yield this.getWindowSize();
            return this.swipe(width / 2 + 150, height / 2, width / 2 - 150, height / 2);
        });
    }
    swipeRight() {
        return __awaiter(this, void 0, void 0, function* () {
            const { width, height } = yield this.getWindowSize();
            return this.swipe(width / 2 - 150, height / 2, width / 2 + 150, height / 2);
        });
    }
    swipeUp() {
        return __awaiter(this, void 0, void 0, function* () {
            const { width, height } = yield this.getWindowSize();
            return this.swipe(width / 2, height / 2 + 150, width / 2, height / 2 - 150);
        });
    }
    swipeDown() {
        return __awaiter(this, void 0, void 0, function* () {
            const { width, height } = yield this.getWindowSize();
            return this.swipe(width / 2, height / 2 - 150, width / 2, height / 2 + 150);
        });
    }
    /**
     * @param orientation  LANDSCAPE | PORTRAIT | UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT |
                      UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN
     */
    orientation(orientation) {
        return __awaiter(this, void 0, void 0, function* () {
            const { value } = !orientation ? yield this.http.fetch('get', 'orientation') : yield this.http.fetch('post', 'orientation', { orientation });
            return value;
        });
    }
    alert() {
        return new Alert(this);
    }
    close() {
        return this.http.fetch('delete', '/');
    }
    selector(selectorObj) {
        const httpclient = this.http.newClient('');
        return new Selector(httpclient, this, selectorObj);
    }
    /**
     * get window size
     */
    getWindowSize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { value } = yield this.http.fetch('get', '/window/size');
            return value;
        });
    }
}

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
    session(bundleId, args = [], environment = {}) {
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
                const { value } = yield http.fetch('get', '/');
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
    /**
     * Screenshot with PNG format
     *
     * @param pngFilename optional, save file name
     * @return png raw data
     */
    screenshot(pngFilename = 'screenshot.png') {
        return __awaiter(this, void 0, void 0, function* () {
            const { value } = yield this.http.fetch('get', 'screenshot');
            fs.writeFileSync(pngFilename, value, 'base64');
            return value;
        });
    }
}

const wda = {
    Client
};

module.exports = wda;
//# sourceMappingURL=wda.js.map
