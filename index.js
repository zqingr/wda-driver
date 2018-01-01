const wda = require('./dist/wda')
console.log(wda)
const c = new wda.Client('http://localhost:8100')

async function start () {
  console.log(await c.status())
  console.log(await c.screenshot('1.png'))
  // await c.home()
  const s = await c.session()
  await s.swipeLeft()
  console.log(1)
}

start()