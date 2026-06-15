import { describe, it, expect } from 'vitest'
import { createMoney, addMoney, subtractMoney, sumMoney } from './money'

describe('createMoney()', () => {
  it('creates a Money value with the given amount and currency', () => {
    const result = createMoney(1000, 'USD')
    expect(result.amount).toBe(1000)
    expect(result.currency).toBe('USD')
  })

  it('accepts zero', () => {
    expect(createMoney(0, 'EUR').amount).toBe(0)
  })

  it('accepts negative integers', () => {
    expect(createMoney(-500, 'GBP').amount).toBe(-500)
  })

  it('throws when amount is not an integer', () => {
    expect(() => createMoney(10.5, 'USD')).toThrow()
    expect(() => createMoney(0.1, 'USD')).toThrow()
    expect(() => createMoney(NaN, 'USD')).toThrow()
  })
})

describe('addMoney()', () => {
  it('adds two amounts in the same currency', () => {
    const result = addMoney(createMoney(300, 'USD'), createMoney(150, 'USD'))
    expect(result.amount).toBe(450)
    expect(result.currency).toBe('USD')
  })

  it('adds when one operand is negative', () => {
    expect(addMoney(createMoney(500, 'USD'), createMoney(-200, 'USD')).amount).toBe(300)
  })

  it('throws when currencies differ', () => {
    expect(() => addMoney(createMoney(100, 'USD'), createMoney(100, 'EUR'))).toThrow()
  })
})

describe('subtractMoney()', () => {
  it('subtracts two amounts in the same currency', () => {
    const result = subtractMoney(createMoney(500, 'EUR'), createMoney(200, 'EUR'))
    expect(result.amount).toBe(300)
    expect(result.currency).toBe('EUR')
  })

  it('allows a negative result', () => {
    expect(subtractMoney(createMoney(100, 'USD'), createMoney(300, 'USD')).amount).toBe(-200)
  })

  it('throws when currencies differ', () => {
    expect(() => subtractMoney(createMoney(100, 'USD'), createMoney(50, 'GBP'))).toThrow()
  })
})

describe('sumMoney()', () => {
  it('sums a list of same-currency amounts', () => {
    const result = sumMoney(
      [createMoney(100, 'USD'), createMoney(200, 'USD'), createMoney(50, 'USD')],
      'USD',
    )
    expect(result.amount).toBe(350)
    expect(result.currency).toBe('USD')
  })

  it('returns zero for an empty list', () => {
    const result = sumMoney([], 'USD')
    expect(result.amount).toBe(0)
    expect(result.currency).toBe('USD')
  })

  it('returns the single element unchanged for a one-item list', () => {
    expect(sumMoney([createMoney(999, 'EUR')], 'EUR').amount).toBe(999)
  })

  it('throws when the list contains mixed currencies', () => {
    expect(() =>
      sumMoney([createMoney(100, 'USD'), createMoney(50, 'EUR')], 'USD'),
    ).toThrow()
  })
})
