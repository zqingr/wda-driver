import Session from "./session";
import HTTPClient from './httpclient'
import ELEMENTS from '../config/xcuiElementTypes'
import sleep from '../util/sleep'
import Element from './element'

interface SelectorObj {
  predicate: string // predicate string
  id: string // raw identifier
  className: string // attr of className
  type: string // alias of className
  name: string // attr for name
  nameContains: string // attr of name contains
  nameMatches: string // regex string
  text: string // alias of name
  textContains: string // alias of nameContains
  textMatches: string // alias of nameMatches
  value: string // attr of value, not used in most times
  valueContains: string // attr of value contains
  label: string // attr for label
  labelContains: string // attr for label contains
  visible: boolean // is visible
  enabled: boolean // is enabled
  classChain: string // string of ios chain query, eg: **/XCUIElementTypeOther[`value BEGINSWITH 'blabla'`]
  xpath: string // xpath string, a little slow, but works fine
  timeout: number // maxium wait element time, default 10.0s
  index: number // index of founded elements
  parentClassChains: string[]
}

class Selector {
  http: HTTPClient
  session: Session

  predicate: string
  id: string
  className: string
  name: string
  namePart: string
  nameRegex: string
  value: string
  valuePart: string
  label: string
  labelPart: string
  visible: boolean
  enabled: boolean
  index: number
  xpath: string
  classChain: string
  timeout: number
  parentClassChains: string[]

  // WDA use two key to find elements "using", "value"
  // Examples:
  // "using" can be on of 
  //     "partial link text", "link text"
  //     "name", "id", "accessibility id"
  //     "class name", "class chain", "xpath", "predicate string"
  
  // predicate string support many keys
  //     UID,
  //     accessibilityContainer,
  //     accessible,
  //     enabled,
  //     frame,
  //     label,
  //     name,
  //     rect,
  //     type,
  //     value,
  //     visible,
  //     wdAccessibilityContainer,
  //     wdAccessible,
  //     wdEnabled,
  //     wdFrame,
  //     wdLabel,
  //     wdName,
  //     wdRect,
  //     wdType,
  //     wdUID,
  //     wdValue,
  //     wdVisible
  constructor (httpclient: HTTPClient, session: Session, selectorObj: SelectorObj) {
    this.http = httpclient
    this.session = session

    this.predicate = selectorObj.predicate
    this.id = selectorObj.id
    this.className = selectorObj.className || selectorObj.type
    this.name = this.addEscapeCharacterForQuotePrimeCharacter(selectorObj.name || selectorObj.text)
    this.namePart = selectorObj.nameContains || selectorObj.textContains
    this.nameRegex = selectorObj.nameMatches || selectorObj.textMatches
    this.value = selectorObj.value
    this.valuePart = selectorObj.valueContains
    this.label = selectorObj.label
    this.labelPart = selectorObj.labelContains
    this.enabled = selectorObj.enabled
    this.visible = selectorObj.visible
    this.index = selectorObj.index || 0

    this.xpath = this.fixXcuiType(selectorObj.xpath)
    this.classChain = this.fixXcuiType(selectorObj.classChain)
    this.timeout = selectorObj.timeout || 10
    this.parentClassChains = selectorObj.parentClassChains || []

    // some fixtures
    if (this.className && !this.className.startsWith('XCUIElementType')) {
      this.className = 'XCUIElementType' + this.className
    }

    if (this.nameRegex) {
      if (!this.nameRegex.startsWith('^') && this.nameRegex.startsWith('.*')) {
        this.nameRegex = '.*' + this.nameRegex
      }
      if (!this.nameRegex.endsWith('$') && !this.nameRegex.endsWith('.*')) {
        this.nameRegex = this.nameRegex + '.*'
      }
    }
  }

  /**
   * Fix for https://github.com/openatx/facebook-wda/issues/33
   *    
   * @param v
   * @return string with properly formated quotes, or non changed text
   */
  private addEscapeCharacterForQuotePrimeCharacter (text: string) {
    return text.replace("'", "\\'").replace('"','\\"')
  }

  private fixXcuiType (s: string) {
    if (!s) return ''
    const reElement = ELEMENTS.join('|')

    return s.replace(new RegExp("(" + reElement + ")"), a => 'XCUIElementType' + a)
  }

  /**
    HTTP example response:
    [
        {"ELEMENT": "E2FF5B2A-DBDF-4E67-9179-91609480D80A"},
        {"ELEMENT": "597B1A1E-70B9-4CBE-ACAD-40943B0A6034"}
    ]
   */
  private async wdasearch (using: string, value: string): Promise<any[]> {
    const elementIds: any[] = []
    const { value: data } = await this.http.fetch('post', '/elements', { using , value })
    data.forEach((d: any) => {
      elementIds.push(d['ELEMENT'])
    })
    return elementIds
  }

  // just return if aleady exists predicate
  private genClassChain () {
    if (this.predicate) {
      return '/XCUIElementTypeAny[`' + this.predicate + '`]'
    }

    const qs: string[] = []
    if (this.name) {
      qs.push(`name == '${this.name}'`)
    }
    if (this.namePart) {
      qs.push(`name CONTAINS '${this.namePart}'`)
    }
    if (this.nameRegex) {
      qs.push(`name MATCHES '${this.nameRegex}'`)
    }
    if (this.label) {
      qs.push(`label == '${this.label}'`)
    }
    if (this.labelPart) {
      qs.push(`label CONTAINS '${this.labelPart}'`)
    }
    if (this.value) {
      qs.push(`value == '${this.value}'`)
    }
    if (this.valuePart) {
      qs.push(`value CONTAINS ’${this.valuePart}'`)
    }
    if (this.visible !== null && this.visible !== undefined) {
      qs.push(`visible == ${this.visible.toString()}`)
    }
    if (this.enabled !== null && this.enabled !== undefined) {
      qs.push(`enabled == ${this.enabled.toString()}`)
    }
    const predicate = qs.join(' AND ')
    let chain = '/' + (this.className || 'XCUIElementTypeAny')
    if (predicate) {
      chain = chain + '[`' + predicate + '`]'
    }
    if (this.index) {
      chain = chain + `[${this.index}]`
    }
    return chain
  }

  findElementIds () {
    if (this.id)
      return this.wdasearch('id', this.id)
    if (this.predicate)
      return this.wdasearch('predicate string', this.predicate)
    if (this.xpath)
      return this.wdasearch('xpath', this.xpath)
    if (this.classChain)
      return this.wdasearch('class chain', this.classChain)

    const chain = '**' + this.parentClassChains.join() + this.genClassChain()
    return this.wdasearch('class chain', chain)
  }

  // return Element (list): all the elements
  async findElements () {
    const es: any[] = []
    const ids = await this.findElementIds()
    ids.forEach(id => {
      const e = new Element(this.http.newClient(''), id)
      es.push(e)
    })
    return es
  }

  async count () {
    const ids = await this.findElementIds()
    return ids.length
  }

  /**
   * 
   * @param timeout timeout for query element, unit seconds Default 10s
   * @return Element: UI Element
   */
  async get (timeout: number = this.timeout): Promise<Element> {
    const startTime = new Date().getTime()
    while (true) {
      const elems = await this.findElements()
      if (elems.length > 0){
        return elems[0]
      }     
      if (startTime + timeout < new Date().getTime()) {
        break
      }
     await sleep(10)
    }
    // check alert again
    const exists = await this.session.alert.exists()
    if (exists && this.http.alertCallback) {
      this.http.alertCallback()
      return await this.get(timeout)
    }
    return Promise.reject([])
  }

  // Set element wait timeout
  setTimeout (s: number) {
    this.timeout = s
    return this
  }

  child(selectorObj: SelectorObj) {
    const chain = this.genClassChain()
    selectorObj['parentClassChains'] = this.parentClassChains.concat([chain])
    return new Selector(this.http, this.session, selectorObj)
  }
    
  async exists () {
    const ids = await this.findElementIds()
    return ids.length > this.index
  }

  /**
   * Wait element and perform click
   * @param timeout timeout for wait
   * @returns bool: if successfully clicked
   */
  async clickExists (timeout: number = 0) {
    const e = await this.get(timeout)
    if (!e) {
      return false
    }
    e.click()
    return true
  }

  /**
   * alias of get
   * @param timeout timeout seconds
   */
  async wait (timeout: number = this.timeout) {
    return await this.get(timeout)
  }

  async waitGone (timeout: number = this.timeout) {
    const startTime = new Date().getTime()
    while (startTime + timeout > new Date().getTime()) {
      if (await this.exists()) {
        return true
      }
    }
    return false
  }
}

export default Selector
export {
  SelectorObj
}
