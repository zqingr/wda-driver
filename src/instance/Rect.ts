class Rect {
  x: number
  y: number
  width: number
  height:  number

  constructor (x: number, y: number, width: number, height:  number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  getCenter () {
    const [x, y] = [ this.x+this.width/2, this.y+this.height/2 ]
    return [x, y]
  }

  getOrigin () {
    const { x, y } = this
    return [x, y]
  }

  getLeft() {
    return this.x
  }

  getTop() {
    return this.y
  }

  getRight() {
    return this.x + this.width
  }

  getBottom() {
    return this.y + this.height
  }
}

export default Rect
