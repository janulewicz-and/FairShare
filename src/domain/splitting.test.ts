import { describe, it, expect } from 'vitest'
import { splitExpense } from './splitting'

const sumShares = (shares: Map<string, number>): number =>
  Array.from(shares.values()).reduce((runningTotal, share) => runningTotal + share, 0)

describe('splitExpense() — equal split', () => {
  it('divides evenly when there is no remainder', () => {
    const shares = splitExpense(90, {
      kind: 'equal',
      participantIds: ['alice', 'bob', 'carol'],
    })
    expect(shares.get('alice')).toBe(30)
    expect(shares.get('bob')).toBe(30)
    expect(shares.get('carol')).toBe(30)
    expect(sumShares(shares)).toBe(90)
  })

  it('distributes the remainder to the first participants so shares sum to the total', () => {
    const shares = splitExpense(100, {
      kind: 'equal',
      participantIds: ['alice', 'bob', 'carol'],
    })
    expect(shares.get('alice')).toBe(34)
    expect(shares.get('bob')).toBe(33)
    expect(shares.get('carol')).toBe(33)
    expect(sumShares(shares)).toBe(100)
  })

  it('assigns the full amount to a single participant', () => {
    const shares = splitExpense(500, {
      kind: 'equal',
      participantIds: ['alice'],
    })
    expect(shares.get('alice')).toBe(500)
    expect(sumShares(shares)).toBe(500)
  })

  it('assigns zero to every participant when the total is zero', () => {
    const shares = splitExpense(0, {
      kind: 'equal',
      participantIds: ['alice', 'bob'],
    })
    expect(shares.get('alice')).toBe(0)
    expect(shares.get('bob')).toBe(0)
    expect(sumShares(shares)).toBe(0)
  })
})

describe('splitExpense() — exactAmounts split', () => {
  it('returns the provided shares when they sum to the total', () => {
    const shares = splitExpense(100, {
      kind: 'exactAmounts',
      amountByParticipantId: new Map([
        ['alice', 60],
        ['bob', 40],
      ]),
    })
    expect(shares.get('alice')).toBe(60)
    expect(shares.get('bob')).toBe(40)
    expect(sumShares(shares)).toBe(100)
  })

  it('throws when the provided shares do not sum to the total', () => {
    expect(() =>
      splitExpense(100, {
        kind: 'exactAmounts',
        amountByParticipantId: new Map([
          ['alice', 60],
          ['bob', 30],
        ]),
      }),
    ).toThrow()
  })
})
