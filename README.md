# node-wda

Facebook WebDriverAgent Node Client Library (not official)

This project is a transplant of  this project https://github.com/openatx/facebook-wda

Most functions finished.

## Installation
1. You need to start WebDriverAgent by yourself

 Follow the instructions in <https://github.com/facebook/WebDriverAgent>

 It is better to start with Xcode to prevent CodeSign issues.

 But it is also ok to start WDA with command line.

 ```
 xcodebuild -project WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner -destination 'platform=iOS Simulator,name=iPhone 6' test
 ```

2. Install node wda client (wait for update to npm when this project complete)

 ```
 ...
 ```

## TCP connection over USB (optional)
You can use wifi network, it is very convinient, but not very stable enough.

I found a tools named `iproxy` which can forward device port to localhost, it\'s source code is here <https://github.com/libimobiledevice/libusbmuxd>

The usage is very simple `iproxy <local port> <remote port> [udid]`

## Configuration
```javascript
import wda from wda
```

## How to use
### Create a client

```javascript
import wda from wda

const c = new wda.Client('http://localhost:8100')

// http://localhost:8100 is the default value if $DEVICE_URL is empty
c = wda.Client()
```

### Client

```javascript
// Show status
console.log(await c.status())

// Press home button
await c.home()

// Hit healthcheck
await c.healthcheck()

// Get page source

// format (str): only 'xml' and 'json' source types are supported
// accessible (bool): when set to true, format is always 'json'
const source = await c.source() // format XML
const source = await c.source(null, true) // default false, format JSON
```

Take screenshot, only can save format png

```javascript
await c.screenshot('screen.png')
```

Open app

```javascript
const s = await c.session('com.apple.Health')
console.log(await s.orientation())
await s.close()
```

For web browser like Safari you can define page whit which will be opened:
```javascript
const s = await c.session('com.apple.mobilesafari', ['-u', 'https://www.google.com/ncr'])
console.log(await s.orientation())
await s.close()
```

### Session operations
```javascript
// Current bundleId and sessionId
console.log(s.getId(), s.getBundleId())

// One of <PORTRAIT | LANDSCAPE>
console.log(await s.orientation()) // expect PORTRAIT

// Change orientation
// LANDSCAPE | PORTRAIT | UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT |UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN
await s.orientation(orientation)

// Deactivate App for some time
await s.deactivate(5) // 5s

// Get width and height
console.log(await s.getWindowSize())
// Expect json output
// For example: {'height': 736, 'width': 414}

// Simulate touch
await s.tap(88, 200)

// Double touch
await s.doubleTap(200, 200)

// Simulate swipe, utilizing drag api
await s.swipe(x1, y1, x2, y2, 0.5) // 0.5s
await s.swipeLeft()
await s.swipeRight()
await s.swipeUp()
await s.swipeDown()

// tap hold
await s.tapHold(x, y, 1.0)
```

### Find element
> Note: if element not found, will throw error

```javascript
// For example, expect: true or false
// using id to find element and check if exists
const selector = s.selector({id: "URL"})
await selector.exists() // return true or false

// using id or other query conditions
s.selector({id: 'URL'})
s.selector({name: 'URL'})
s.selector({text: "URL"}) // text is alias of name
s.selector({nameContains: 'UR'})
s.selector({label: 'Address'})
s.selector({labelContains: 'Addr'})
s.selector({name:'URL', index: 1}) # find the second element. index starts from 0

// combines search conditions
// attributes bellow can combines
// :"className", "name", "label", "visible", "enabled"

s.selector({className: 'Button', name: 'URL', visible: true, labelContains: "Addr"})
```

More powerful findding method

```javascript
s.selector({xpath: '//Button[@name="URL"]'})
s.selector({classChain: '**/Button[`name == "URL"`]'})
s.selector({predicate: 'name LIKE "UR*"'})
```

### Element operations (eg: `tap`, `scroll`, `set_text` etc...)
Exmaple search element and tap

```javascript
// Get first match Element object
// The function get() is very important.it will return an Element object
// when elements founded in 10 seconds(:default:), Element object returns

const e = await s.selector({text: 'Dashboard'}).get(10) // e is elements object
await e.tap() // tap element
```

Click element if exists

```javascript
await s.selector({text: 'Dashboard'}).clickExists() // return immediately if not found

await s.selector({text: 'Dashboard'}).clickExists(50) // wait for 5s
```

Other Element operations

```javascript
// Check if elements exists
console.log(await s.selector({text: 'Dashboard'}).exists())

// Find all matches elements, return Array of Element object
await s.selector({className: 'Other'}).findElements()

// Use index to find second element
await s.selector({className: 'Other', index: 2}).exists()

// Use child to search sub elements
await s.selector({text: 'Dashboard'}).child({className: 'Cell'}).exists()

// Default timeout is 10 seconds
// But you can change by
s.setTimeout(100000)

// do element operations
await e.tap()
await e.click() // alias of tap
// The default keyboard must be requested
await e.clearText()
await e.setText("Hello world")
await e.tapHold(2) // tapAndHold for 2.0s

await e.scroll() // scroll to make element visiable

// directions can be "up", "down", "left", "right"
// swipe distance default to its height or width according to the direction
await e.scroll('up')

// Set text
await e.setText("Hello WDA") // normal usage
await e.setText("Hello WDA\n") // send text with enter
await e.setText("\b\b\b") // delete 3 chars

// Wait element gone
await s({className: 'Other'}).waitGone(10)

// Swipe
s(className="Image").swipe("left")

// Pinch
s(className="Map").pinch(2, 1) # scale=2, speed=1
s(className="Map").pinch(0.1, -1) # scale=0.1, speed=-1 (I donot very understand too)

// properties (bool)
e.accessible
e.displayed
e.enabled

// properties (str)
e.text # ex: Dashboard
e.className # ex: XCUIElementTypeStaticText
e.value # ex: github.com

// Bounds return namedtuple
rect = e.bounds # ex: Rect(x=144, y=28, width=88.0, height=27.0)
rect.x # expect 144
```

Alert

```python
print s.alert.exists
print s.alert.text
s.alert.accept() # Actually do click first alert button
s.alert.dismiss() # Actually do click second alert button
s.alert.wait(5) # if alert apper in 5 second it will return True,else return False (default 20.0)
s.alert.wait() # wait alert apper in 2 second

s.alert.buttons()
// example return: ["设置", "好"]

s.alert.click("设置")
```

## TODO
longTap not done pinch(not found in WDA)

TouchID

* Match Touch ID
* Do not match Touch ID

## How to handle alert message automaticly (need more tests)
For example

```python
import wda

s = wda.Client().session()

def _alert_callback(session):
    session.alert.accept()

s.set_alert_callback(_alert_callback)

// do operations, when alert popup, it will auto accept
s(type="Button").click()
```

## iOS Build-in Apps
**苹果自带应用**

| Name        | Bundle ID                                |
| ----------- | ---------------------------------------- |
| iMovie      | com.apple.iMovie                         |
| Apple Store | com.apple.AppStore                       |
| Weather     | com.apple.weather                        |
| 相机Camera    | com.apple.camera                         |
| iBooks      | com.apple.iBooks                         |
| Health      | com.apple.Health                         |
| Settings    | com.apple.Preferences                    |
| Watch       | com.apple.Bridge                         |
| Maps        | com.apple.Maps                           |
| Game Center | com.apple.gamecenter                     |
| Wallet      | com.apple.Passbook                       |
| 电话          | com.apple.mobilephone                    |
| 备忘录         | com.apple.mobilenotes                    |
| 指南针         | com.apple.compass                        |
| 浏览器         | com.apple.mobilesafari                   |
| 日历          | com.apple.mobilecal                      |
| 信息          | com.apple.MobileSMS                      |
| 时钟          | com.apple.mobiletimer                    |
| 照片          | com.apple.mobileslideshow                |
| 提醒事项        | com.apple.reminders                      |
| Desktop     | com.apple.springboard (Start this will cause your iPhone reboot) |

**第三方应用 Thirdparty**

| Name   | Bundle ID             |
| ------ | --------------------- |
| 腾讯QQ   | com.tencent.mqq       |
| 微信     | com.tencent.xin       |
| 部落冲突   | com.supercell.magic   |
| 钉钉     | com.laiwang.DingTalk  |
| Skype  | com.skype.tomskype    |
| Chrome | com.google.chrome.ios |


Another way to list apps installed on you phone is use `ideviceinstaller`
install with `brew install ideviceinstaller`

List apps with command

```sh
$ ideviceinstaller -l
```

## Tests
测试的用例放在`tests/`目录下，使用iphone SE作为测试机型，系统语言应用。调度框架`pytest`

## Reference
Source code

- [Router](https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBElementCommands.m#L62)
- [Alert](https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBAlertViewCommands.m#L25)

## DESIGN
[DESIGN](DESIGN.md)

## LICENSE
[MIT](LICENSE)

