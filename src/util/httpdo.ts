import sleep from '../util/sleep'
import rp from 'request-promise'

async function httpdo (url: string, method: string = 'GET', payload?: any): Promise<any> {
  // const startTime = new Date().getTime()

  const options = {
      uri: url,
      method,
      body: payload,
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response
  }

  // Do HTTP Request
  // console.log(`Shell: curl -X ${method} -d '${payload}' '${url}'`)
  let res: Response
  try {
    res = await rp(options)
    
  } catch (e) {
    // console.log(`retry to connect, error: ${e}`)
    await sleep(1000)
    res = await rp(options)
  }
  const retjson = res
  // console.log(`Return {{${new Date().getTime() - startTime}ms}}`, retjson)
  return retjson
}

export default httpdo
