export class Vector2D {
  constructor(public x: number, public y: number) {}

  sumar(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  restar(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  multiplicarEscalar(s: number): Vector2D {
    return new Vector2D(this.x * s, this.y * s);
  }

  distanciaA(other: Vector2D): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.hypot(dx, dy);
  }
}
