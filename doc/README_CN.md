# wda-driver

Facebook WebDriverAgent的Node库 

大部分功能都已经完成

## 安装
1. 你需要自己安装和启动 WebDriverAgent

可以跟着官方文档安装： <https://github.com/facebook/WebDriverAgent>

你可以从xcode里面启动调试程序

也可以直接命令行启动

 ```
 xcodebuild -project WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner -destination 'platform=iOS Simulator,name=iPhone 6' test
 ```

2. 安装wda-driver

 ```
npm install --save wda-driver
 ```

## TCP 有时候连接不上 (可选)
你可以直接用wda提供的网络地址，但是不太稳定，有时候会出现连接不上的问题

可以安装iproxy工具 <https://github.com/libimobiledevice/libusbmuxd>

开启非常简单 `iproxy <local port> <remote port> [udid]`

例如：```iproxy 8100 8100```

## 引用
```javascript
const wda = require('wda-driver')
```

## 如何使用
### 建立一个客户端

```javascript
const wda = require('wda-driver')

const c = new wda.Client('http://localhost:8100')

// http://localhost:8100 是默认值，你可以直接这样
c = wda.Client()
```

### 客户端操作

```javascript
// 查看客户端状态
console.log(await c.status())

// 点击home按钮
await c.home()

// Hit healthcheck
await c.healthcheck()

// 获取 page source

// 两个参数
// format (str): 'xml' 或 'json' 
// accessible (bool): 设置为true的时候，只返回json
const source = await c.source() // 格式为 XML
const source = await c.source(null, true) // 默认 false, 格式为 JSON
```

截取屏幕，只支持png格式的图片

```javascript
await c.screenshot('screen.png')
```

打开 app

```javascript
const s = await c.session('com.apple.Health')
console.log(await s.orientation())
await s.close()
```

浏览器可以这样带网址的打开:
```javascript
const s = await c.session('com.apple.mobilesafari', ['-u', 'https://www.google.com/ncr'])
console.log(await s.orientation())
await s.close()
```

### 对话操作
```javascript
// 当前的 bundleId 和 sessionId
console.log(s.getId(), s.getBundleId())

// <PORTRAIT 或者 LANDSCAPE>
console.log(await s.orientation()) // PORTRAIT

// 改变方向
// LANDSCAPE | PORTRAIT | UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT |UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN
await s.orientation(orientation)

// 让app进入后台5秒钟
await s.deactivate(5) // 5s

// 获取高度和宽度
console.log(await s.getWindowSize())
// 返回例子: {'height': 736, 'width': 414}

// 根据坐标点击屏幕
await s.tap(88, 200)

// 双击屏幕
await s.doubleTap(200, 200)

// 滑动相关的方法
await s.swipe(x1, y1, x2, y2, 0.5) // 0.5s
await s.swipeLeft()
await s.swipeRight()
await s.swipeUp()
await s.swipeDown()

// 长按屏幕
await s.tapHold(x, y, 1.0)
```

### 查找元素
```javascript
// 用获取的session的selector方法查找元素
const selector = s.selector({id: "URL"})
await selector.exists() // return true or false

// 用id等查询元素
s.selector({id: 'URL'})
s.selector({name: 'URL'})
s.selector({text: "URL"}) // text是name的别名
s.selector({nameContains: 'UR'})
s.selector({label: 'Address'})
s.selector({labelContains: 'Addr'})
s.selector({name:'URL', index: 1}) // 查找第二个name为URL的元素

// 合并查询
// 属性可以选择一下元素
// :"className", "name", "label", "visible", "enabled"

s.selector({className: 'Button', name: 'URL', visible: true, labelContains: "Addr"})
```

更多牛逼的查询方式

```javascript
s.selector({xpath: '//Button[@name="URL"]'})
s.selector({classChain: '**/Button[`name == "URL"`]'})
s.selector({predicate: 'name LIKE "UR*"'})
```

### 元素操作 (例如: `tap`, `scroll`, `set_text` 等...)
例子：查找一个元素然后点击他

```javascript
// 查找第一个text为Dashboard的元素
// function get() 非常重要.执行后才会返回一个元素对象
// 如果元素在10(默认)秒内查找到了, 就会返回一个元素对象

const e = await s.selector({text: 'Dashboard'}).get(10) // e 是一个元素对象
await e.tap() // 点击元素
```

如果元素存在点击元素

```javascript
await s.selector({text: 'Dashboard'}).clickExists() // 如果不存在会立刻返回

await s.selector({text: 'Dashboard'}).clickExists(5) // 等待5秒
```

其它的元素查找

```javascript
// 查找元素是否存在
console.log(await s.selector({text: 'Dashboard'}).exists())

// 查找所有匹配的元素
await s.selector({className: 'Other'}).findElements()

// 查找第二个元素
await s.selector({className: 'Other', index: 2}).exists()

// 查找子元素
await s.selector({text: 'Dashboard'}).child({className: 'Cell'}).exists()

// 默认是10秒
// 但是你可以自己设置
s.setTimeout(50)

// 元素操作
await e.tap()
await e.click() // tap的别名
// 必须是系统默认键盘，搜狗测试的不行
await e.clearText()
await e.setText("Hello world")
await e.tapHold(2) // 长按2秒

await e.scroll() // 滚动到元素可见出

// 方向可以使 "up", "down", "left", "right"
// 也可以指定移动的距离
await e.scroll('up', 100)

// 发送文字
await e.setText("Hello WDA") // 一般用法
await e.setText("Hello WDA\n") // 发送回车
await e.setText("\b\b\b") // 删除三个字符

// 等待元素小时
await s({className: 'Other'}).waitGone(10)

// Swipe TODO
// s(className="Image").swipe("left")

// 宋芳
s(className="Map").pinch(2, 1) // scale=2, speed=1
s(className="Map").pinch(0.1, -1) // scale=0.1, speed=-1

// 获取属性 (boolean)
await e.getAccessible()
await e.getDisplayed()
await e.getEnabled()
await e.getVisible()
await e.getAccessibilityContainer()

// 或许属性 (字符串)
await e.getId() 
await e.getLabel()
await e.getClassName()
await e.getText()
await e.getName()
await e.getDisplayed()
await e.getEnabled()
await e.getValue()
await e.getValue()

// 返回元素的边界
const rect = await e.getBounds() // Rect { x: 0, y: 73, width: 375, height: 666 }
rect.y // 73
```

警告框

```javascript
console.log(await s.alert().exists())
console.log(await s.alert().text())
console.log(await s.alert().text())

await s.alert().accept() // 其实点击的左侧按钮
await s.alert().dismiss() // 其实点击的第二个按钮
await s.alert().wait(5) // 等待5秒弹框出现
await s.alert().wait() // 默认等待20秒弹窗出现

await s.alert().buttons()
// 例如返回 return: ["设置", "好"]

await s.alert().click('好')
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


另一个获取你手机里面app列表的方法是用 `ideviceinstaller`
安装 `brew install ideviceinstaller`

显示列表

```sh
$ ideviceinstaller -l
```

## Reference
这个项目移植的python项目 https://github.com/openatx/facebook-wda

Source code

- [Router](https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBElementCommands.m#L62)
- [Alert](https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBAlertViewCommands.m#L25)

## DESIGN
[DESIGN](DESIGN.md)

## LICENSE
[MIT](LICENSE)

