import HTTPClient from './httpclient'
import Rect from './Rect'

class Element {
  http: HTTPClient
  private id: string
  constructor (httpclient: HTTPClient, id: string) {
    this.http = httpclient
    this.id = id
  }

  private req (method: string, url: string, data?: any) {
    return this.http.fetch(method, '/element/' + this.id + url, data)
  }

  private wdaReq (method: string, url: string, data?: any) {
    return this.http.fetch(method, '/wda/element/' + this.id + url, data)
  }

  private async prop (key: string) {
    const { value } = await this.req('get', '/' + key.replace(/\/$/, ''))
    return value
  }

  private async wdaProp (key: string) {
    const { value } = await this.wdaReq('get', '/' + key.replace(/\/$/, ''))
    return value
  }

  getId () {
    return this.id
  }

  async getLabel () {
    return await this.prop('attribute/label')
  }

  async getClassName () {
    return await this.prop('attribute/type')
  }

  async getText () {
    return await this.prop('text')
  }

  async getName () {
    return await this.prop('name')
  }

  async getDisplayed () {
    return await this.prop('displayed')
  }

  async getEnabled () {
    return await this.prop('enabled')
  }

  async getValue () {
    return await this.prop('value')
  }

  async getVisible () {
    return await this.prop('visible')
  }

  async getBounds () {
    const value = await this.prop('rect')
    const { x, y, width: w, height: h } = value 
    return new Rect(x, y, w, h)
  }
  
  async getAccessible () {
    return await this.wdaProp('accessible')
  }

  async getAccessibilityContainer () {
    return await this.wdaProp('accessibilityContainer')
  }

  // operations
  async tap () {
    return await this.req('post', '/click')
  }

  async click () {
    // Alias of tap
    return await this.tap()
  }

  /** Tap and hold for a moment
   * @param duration seconds of hold time
   * [[FBRoute POST:@"/wda/element/:uuid/touchAndHold"] respondWithTarget:self action:@selector(handleTouchAndHold:)]
   */
  async tapHold (duration: number = 1) {
    return await this.wdaReq('post', '/touchAndHold', {'duration': duration})
  }

  /**
   * 
   * @param direction one of "visible", "up", "down", "left", "right"
   * @param distance swipe distance, only works when direction is not "visible"
   * 
   * distance=1.0 means, element (width or height) multiply 1.0
   */
  async scroll (direction: "visible"|"up"|"down"|"left"|"right" = 'visible', distance:number = 1.0) {
    if (direction === "visible") {
      return await this.wdaReq('post', '/scroll', {'toVisible': true})
    } else if (['up', 'down', 'left', 'right'].indexOf(direction) > -1) {
      return await this.wdaReq('post', '/scroll', {'direction': direction, 'distance': distance})
    } else {
      throw "Invalid direction"
    }
  }

  /**
   * 
   * @param scale scale must > 0
   * @param velocity velocity must be less than zero when scale is less than 1
   * Example:
            pinchIn  -> scale:0.5, velocity: -1
            pinchOut -> scale:2.0, velocity: 1
   */
  async pinch (scale: number, velocity: number) {
    return await this.wdaReq('post', '/pinch', { scale, velocity })
  }

  async setText (value: string) {
    return await this.req('post', '/value', {'value': value})
  }

  async clearText () {
    return await this.req('post', '/clear')
  }
}

export default Element
