import httpdo from '../util/httpdo'

const urljoin = require('url-join')

class HTTPClient {
  address: string
  alertCallback: Function | undefined

  constructor (address: string, alertCallback?: Function) {
    this.address = address
    this.alertCallback = alertCallback
  }

  newClient (path: string) {
    return new HTTPClient(urljoin(this.address, path), this.alertCallback)
  }

  async fetch (method: string, url: string, data?: any) {
    return await this.fetchNoAlert(method, url, data)
  }

  protected async fetchNoAlert (method: string, queryUrl: string, data?: any, depth?: number): Promise<any> {
    const targetUrl = urljoin(this.address, queryUrl)

    try {
      return await httpdo(targetUrl, method, data)
    } catch (e) {
      if (depth && depth >= 10) {
        return Promise.reject(e)
      }
      this.alertCallback && this.alertCallback()
      return await this.fetchNoAlert(method, queryUrl, data, (depth || 0) + 1)
    }
  }
}

export default HTTPClient
