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
  // await c.home()
  const s = await c.session()
  await s.tap(588, 1866)
  await s.tap(88, 1266)
  await s.tap(88, 200)
  await s.swipe(88, 200, 288, 200)
  const pixels = await getPixelsPro('./test/screenshot/5.png')
  console.log(1, pixels)
}

start()