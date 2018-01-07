import Session from './session'
import HTTPClient from './httpclient'
import sleep from '../util/sleep'

class Alert {
  s: Session
  http: HTTPClient
  
  constructor (session: Session) {
    this.s = session
    this.http = session.http
  }

  async exists () {
    let text: string
    try {
      text = await this.text()
    } catch (e) {
      return false
    }
    return !!text
  }

  async text () {
    const { value } = await this.http.fetch('get', '/alert/text')
    return typeof value === 'string' ? value : ''
  }

  async wait (timeout: number = 20) {
    const startTime = new Date().getTime()
    while (new Date().getTime() - startTime < (timeout * 1000)) {
      if ( await this.exists() ) {
        return true
      }
      await sleep(20)
    } 
    return false
  }

  accept () {
    return this.http.fetch('post', '/alert/accept')
  }

  dismiss () {
    return this.http.fetch('post', '/alert/dismiss')
  }

  async buttons () {
    const { value } = await this.http.fetch('get', '/wda/alert/buttons')

    return value
  }

  /**
   * @param name the name of the button
   */
  click (name: string) {
    return this.http.fetch('post', '/alert/accept', { name })
  }
}

export default Alert