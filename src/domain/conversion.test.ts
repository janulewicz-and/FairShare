import { describe, it, expect } from 'vitest'
import { convertToBase } from './conversion'

describe('convertToBase()', () => {
  it('returns the same minor-unit amount when the rate is 1.0', () => {
    expect(convertToBase(1000, 1.0)).toBe(1000)
  })

  it('rounds a fractional rate to the nearest whole minor unit', () => {
    expect(convertToBase(333, 0.9)).toBe(300)
  })

  it('rounds a .5 minor unit up, per the round-half-up rule', () => {
    expect(convertToBase(100, 0.125)).toBe(13)
  })

  it('converts a negative amount with the correct sign, rounding half up toward positive infinity', () => {
    expect(convertToBase(-100, 0.125)).toBe(-12)
  })

  it('converts a negative amount with an exact rate', () => {
    expect(convertToBase(-1000, 0.85)).toBe(-850)
  })

  it('rounds half up correctly despite IEEE 754 floating-point representation noise', () => {
    expect(convertToBase(90, 1.15)).toBe(104)
    expect(convertToBase(50, 1.15)).toBe(58)
  })

  it('throws when the amount is not an integer', () => {
    expect(() => convertToBase(10.5, 1.0)).toThrow()
  })

  it('throws when the exchange rate is zero or negative', () => {
    expect(() => convertToBase(1000, 0)).toThrow()
    expect(() => convertToBase(1000, -1.2)).toThrow()
  })

  it('throws when the exchange rate is not finite', () => {
    expect(() => convertToBase(1000, Infinity)).toThrow()
    expect(() => convertToBase(1000, NaN)).toThrow()
  })
})
