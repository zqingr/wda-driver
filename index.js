const wda = require('./dist/wda')
const PNG = require("png-js")

function getPixelsPro (imgPath) {
  return new Promise((resolve, reject) => {
    PNG.decode(imgPath, function (pixels) {
      // if (err) {
      //   reject(err)
      // }
      resolve(pixels)
    })
  })
}

const c = new wda.Client('http://localhost:8100')

async function start () {
  // console.log(await c.status())
  // await c.screenshot('./test/screenshot/1.png')
  // const data = await c.source('xml', true)
  const s = await c.session()
  // const s = await c.session('com.apple.mobilesafari', ['-u', 'https://www.google.com/ncr'])
  // console.log(await s.orientation())
  // console.log(await s.close())
  // await s.tap(588, 1866)
  // await s.tap(88, 1266)
  // await s.tap(88, 200)
  // await s.swipe(88, 200, 288, 200)

  // const s = await c.session()
  // console.log(s.getId(), s.getBundleId())
  // console.log(await s.orientation())
  // console.log(await s.getWindowSize())
  // await s.swipe(100, 400, 200, 400, .1)
  // await s.tapHold(100, 400, 8)
  // await s.keyboardDismiss()
  // const selector = await s.selector({name: "切换到语音输入", label: "切换到语音输入"})
  const element = await s.selector({name: '表情'}).clickExists()
  console.log(element)
  // const element = await selector.get(10)
  // await element.tap()

  // console.log(await selector.exists())
}

start()