export class Fraction {
  readonly numerator: number;
  readonly denominator: number;

  static readonly ZERO = new Fraction(0, 1);
  static readonly ONE = new Fraction(1, 1);

  constructor(numerator: number, denominator: number) {
    if (denominator === 0) throw new Error('Denominator cannot be zero');
    // Normalize sign
    if (denominator < 0) {
      numerator = -numerator;
      denominator = -denominator;
    }
    const g = Fraction.gcd(Math.abs(numerator), Math.abs(denominator));
    this.numerator = numerator / g;
    this.denominator = denominator / g;
  }

  static gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a === 0 ? 1 : a;
  }

  static lcm(a: number, b: number): number {
    return (Math.abs(a) / Fraction.gcd(Math.abs(a), Math.abs(b))) * Math.abs(b);
  }

  static fromNumber(n: number): Fraction {
    return new Fraction(n, 1);
  }

  add(other: Fraction): Fraction {
    const num = this.numerator * other.denominator + other.numerator * this.denominator;
    const den = this.denominator * other.denominator;
    return new Fraction(num, den);
  }

  subtract(other: Fraction): Fraction {
    const num = this.numerator * other.denominator - other.numerator * this.denominator;
    const den = this.denominator * other.denominator;
    return new Fraction(num, den);
  }

  multiply(other: Fraction): Fraction {
    return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator);
  }

  divide(other: Fraction): Fraction {
    return new Fraction(this.numerator * other.denominator, this.denominator * other.numerator);
  }

  compareTo(other: Fraction): number {
    const diff = this.numerator * other.denominator - other.numerator * this.denominator;
    if (diff < 0) return -1;
    if (diff > 0) return 1;
    return 0;
  }

  isGreaterThan(value: number | Fraction): boolean {
    const other = value instanceof Fraction ? value : Fraction.fromNumber(value);
    return this.compareTo(other) > 0;
  }

  isLessThan(value: number | Fraction): boolean {
    const other = value instanceof Fraction ? value : Fraction.fromNumber(value);
    return this.compareTo(other) < 0;
  }

  equals(other: Fraction): boolean {
    return this.compareTo(other) === 0;
  }

  isZero(): boolean {
    return this.numerator === 0;
  }

  simplify(): Fraction {
    // Already simplified in constructor
    return this;
  }

  toDecimal(): number {
    return this.numerator / this.denominator;
  }

  toString(): string {
    if (this.denominator === 1) return `${this.numerator}`;
    return `${this.numerator}/${this.denominator}`;
  }

  /** Scale numerator to a given common denominator (denominator must be a multiple) */
  toCommonDenominator(cd: number): number {
    const factor = cd / this.denominator;
    return this.numerator * factor;
  }
}

export function sumFractions(fractions: Fraction[]): Fraction {
  return fractions.reduce((acc, f) => acc.add(f), Fraction.ZERO);
}
