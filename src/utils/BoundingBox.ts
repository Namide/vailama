export class BoundingBox {
  left: number
  right: number
  top: number
  bottom: number

  width: number
  height: number

  constructor ({
    left,
    right,
    top,
    bottom,
  }: {
    left: number,
    right: number,
    top: number,
    bottom: number,
  }) {
    this.left = left
    this.right = right
    this.top = top
    this.bottom = bottom

    this.width = Math.abs(right - left)
    this.height = Math.abs(top - bottom)
  }
}