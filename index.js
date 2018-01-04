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
  await c.screenshot('./test/screenshot/1.png')
  // const data = await c.source('xml', true)
  // const s = await c.session()
  const s = await c.session('com.apple.Health')
  console.log(s.orientation)
  // await s.tap(588, 1866)
  // await s.tap(88, 1266)
  // await s.tap(88, 200)
  // await s.swipe(88, 200, 288, 200)
}

start()