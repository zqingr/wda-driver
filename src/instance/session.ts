import HTTPClient from './httpclient'
import Alert from './alert'
import Selector, { SelectorObj } from './selector'

class Session {
  http: HTTPClient
  capabilities: any
  alertCallback: Function
  private sid: string

  /**
   * @param httpclient HTTPClient
   * @param value get status object
   */
  constructor (httpclient: HTTPClient, value: any) {
    this.http = httpclient

    // Example session value
    // "capabilities": {
    //     "CFBundleIdentifier": "com.netease.aabbcc",
    //     "browserName": "?????",
    //     "device": "iphone",
    //     "sdkVersion": "10.2"
    // }
    this.capabilities = value.capabilities
    this.sid = value.sessionId
  }

  protected getId () {
    return this.sid
  }

  // the session matched bundle id
  protected getBundleId () {
    return this.capabilities.CFBundleIdentifier
  }
  
  /**
   * @param callback called when alert popup
   */
  setAlertCallback (callback: Function) {
    this.alertCallback = callback
  }

  /**
   * TODO: Never successed using before.
   * https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBSessionCommands.m#L43
   * 
   * @param url string
   */
  async openUrl (url: string) {
    return await this.http.fetch('post', 'url', {'url': url})
  }

  /**
   * @param duration deactivate time, seconds
   */
  deactivate (duration: number) {
    return this.http.fetch('post', '/wda/deactivateApp', { duration })
  }

  tap (x: number, y: number) {
    return this.http.fetch('post', '/wda/tap/0', { x, y })
  }

  doubleTap (x: number, y: number) {
    return this.http.fetch('post', '/wda/doubleTap', { x, y })
  }

  /**
   * Tap and hold for a moment
   * @param x position x
   * @param y position y
   * @param duration seconds of hold time
   * 
   * [[FBRoute POST:@"/wda/touchAndHold"] respondWithTarget:self action:@selector(handleTouchAndHoldCoordinate:)]
   */
  tapHold (x: number, y: number, duration: number) {
    return this.http.fetch('post', '/wda/touchAndHold', { x, y, duration })
  }

  /**
   * 
   * @param fromX position fromX
   * @param fromY position fromY
   * @param toX position toX
   * @param toY position toY
   * @param duration start coordinate press duration (seconds)
   * 
   * [[FBRoute POST:@"/wda/dragfromtoforduration"] respondWithTarget:self action:@selector(handleDragCoordinate:)]
   */
  swipe (fromX: number, fromY: number, toX: number, toY: number, duration: number = 0) {
    return this.http.fetch('post', '/wda/dragfromtoforduration', { fromX, fromY, toX, toY, duration })
  }

  async swipeLeft () {
    const { width, height } = await this.getWindowSize()
    return this.swipe(width/2 + 150, height/2, width/2 - 150, height/2)
  }

  async swipeRight () {
    const { width, height } = await this.getWindowSize()
    return this.swipe(width/2 - 150, height/2, width/2 + 150, height/2)
  }

  async swipeUp () {
    const { width, height } = await this.getWindowSize()
    return this.swipe(width/2, height/2 + 150, width/2, height/2 - 150)
  }

  async swipeDown () {
    const { width, height } = await this.getWindowSize()
    return this.swipe(width/2, height/2 - 150, width/2, height/2 + 150)
  }

  /**
   * @param orientation  LANDSCAPE | PORTRAIT | UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT |
                    UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN
   */
  async orientation (orientation?: string) {
    const { value } = !orientation ? await this.http.fetch('get', 'orientation') : await this.http.fetch('post', 'orientation', { orientation })
    return value
  }

  alert (): Alert {
    return new Alert(this)
  }

  close () {
    return this.http.fetch('delete', '/')
  }
  
  selector (selectorObj: SelectorObj) {
    const httpclient = this.http.newClient('')
    return new Selector(httpclient, this, selectorObj)
  }

  /**
   * get window size
   */
  private async getWindowSize (): Promise<{ width: number, height: number }> {
    const { value } = await this.http.fetch('get', '/window/size')
    return value
  }

}

export default Session
