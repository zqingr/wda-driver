import HTTPClient from './httpclient'
import Session from './session'
import fs from 'fs'

class Client {
  http: HTTPClient

  // Args:
  // target (string): the device url

  // If target is None, set to "http://localhost:8100"
  constructor (url: string = 'http://localhost:8100') {
    this.http = new HTTPClient(url)
  }

  async status () {
    const res = await this.http.fetch('get', 'status')

    return res
  }

  async home () {
    // Press home button
    return await this.http.fetch('post', '/wda/homescreen')
  }

  async healthcheck () {
    // Hit healthcheck
    return await this.http.fetch('get', '/wda/healthcheck')
  }

  async source (format: 'xml' | 'json' = 'xml', accessible: boolean = false) {
    // Args:
    //   format (str): only 'xml' and 'json' source types are supported
    //   accessible (bool): when set to true, format is always 'json'
    let res: any
    if (accessible) {
      res = await this.http.fetch('get', '/wda/accessibleSource')
    } else {
      res = await this.http.fetch('get', 'source?format=' + format)
    }
    return res.value
  }

  async session (bundleId?: string, args: string[] = [], environment: any = {}) {
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
      const status = await this.status()
      const sid = status['sessionId']
      if (!sid) {
        throw 'no session created ever'
      }

      const http = this.http.newClient('session/' + sid)
      const { value } = await http.fetch('get', '/')
      return await new Session(http, value)
    }

    if (!Array.isArray(args)) {
      throw 'arguments must be a array'
    }

    if (typeof environment !== 'object') {
      throw 'environment must be a object'
    }

    const capabilities = {
      bundleId,
      arguments: args,
      environment,
      shouldWaitForQuiescence: true,
    }

    const data = {
      desiredCapabilities: capabilities
    }

    const res = await this.http.fetch('post', 'session', data)
    const httpclient = this.http.newClient('session/' + res.sessionId)
    const value = await httpclient.fetch('get', '/')
    return new Session(httpclient, value)
  }

  /**
   * Screenshot with PNG format
   * 
   * @param pngFilename optional, save file name
   * @return png raw data
   */
  async screenshot (pngFilename: string = 'screenshot.png') {
    const { value } = await this.http.fetch('get', 'screenshot')
    fs.writeFileSync(pngFilename, value, 'base64')
    return value
  }
}

export default Client
