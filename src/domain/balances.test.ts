import { describe, it, expect } from 'vitest'
import { calculateParticipantBalances, type Expense } from './balances'

const sumAllBalances = (balances: Map<string, number>): number =>
  Array.from(balances.values()).reduce(
    (runningTotal, balance) => runningTotal + balance,
    0,
  )

describe('calculateParticipantBalances()', () => {
  it('gives the payer a positive balance and the others a negative balance for a single equal-split expense', () => {
    const expenses: Expense[] = [
      {
        id: 'expense-1',
        payerId: 'alice',
        amountMinorUnits: 900,
        exchangeRateToBase: 1.0,
        splitMethod: {
          kind: 'equal',
          participantIds: ['alice', 'bob', 'carol'],
        },
      },
    ]

    const balances = calculateParticipantBalances(expenses)

    expect(balances.get('alice')).toBe(600)
    expect(balances.get('bob')).toBe(-300)
    expect(balances.get('carol')).toBe(-300)
  })

  it('accumulates balances correctly across multiple expenses with different payers', () => {
    const expenses: Expense[] = [
      {
        id: 'expense-1',
        payerId: 'alice',
        amountMinorUnits: 600,
        exchangeRateToBase: 1.0,
        splitMethod: {
          kind: 'equal',
          participantIds: ['alice', 'bob'],
        },
      },
      {
        id: 'expense-2',
        payerId: 'bob',
        amountMinorUnits: 400,
        exchangeRateToBase: 1.0,
        splitMethod: {
          kind: 'equal',
          participantIds: ['alice', 'bob'],
        },
      },
    ]

    const balances = calculateParticipantBalances(expenses)

    expect(balances.get('alice')).toBe(100)
    expect(balances.get('bob')).toBe(-100)
  })

  it('gives a participant who paid nothing a fully negative balance equal to their total share', () => {
    const expenses: Expense[] = [
      {
        id: 'expense-1',
        payerId: 'alice',
        amountMinorUnits: 300,
        exchangeRateToBase: 1.0,
        splitMethod: {
          kind: 'equal',
          participantIds: ['alice', 'bob', 'carol'],
        },
      },
    ]

    const balances = calculateParticipantBalances(expenses)

    expect(balances.get('bob')).toBe(-100)
    expect(balances.get('carol')).toBe(-100)
  })

  it('all balances sum to zero (money is conserved)', () => {
    const expenses: Expense[] = [
      {
        id: 'expense-1',
        payerId: 'alice',
        amountMinorUnits: 750,
        exchangeRateToBase: 1.0,
        splitMethod: {
          kind: 'equal',
          participantIds: ['alice', 'bob', 'carol'],
        },
      },
      {
        id: 'expense-2',
        payerId: 'bob',
        amountMinorUnits: 1200,
        exchangeRateToBase: 1.0,
        splitMethod: {
          kind: 'exactAmounts',
          amountByParticipantId: new Map([
            ['alice', 500],
            ['bob', 400],
            ['carol', 300],
          ]),
        },
      },
    ]

    const balances = calculateParticipantBalances(expenses)

    expect(sumAllBalances(balances)).toBe(0)
  })

  it('balances still sum to zero when an equal split produces a remainder', () => {
    const expenses: Expense[] = [
      {
        id: 'expense-1',
        payerId: 'alice',
        amountMinorUnits: 100,
        exchangeRateToBase: 1.0,
        splitMethod: {
          kind: 'equal',
          participantIds: ['alice', 'bob', 'carol'],
        },
      },
    ]

    const balances = calculateParticipantBalances(expenses)

    expect(sumAllBalances(balances)).toBe(0)
  })

  it('converts each expense through its own fixed rate when a group has two currencies', () => {
    const expenses: Expense[] = [
      {
        id: 'expense-1',
        payerId: 'alice',
        amountMinorUnits: 1000,
        exchangeRateToBase: 1.1,
        splitMethod: {
          kind: 'equal',
          participantIds: ['alice', 'bob'],
        },
      },
      {
        id: 'expense-2',
        payerId: 'bob',
        amountMinorUnits: 600,
        exchangeRateToBase: 1.25,
        splitMethod: {
          kind: 'equal',
          participantIds: ['alice', 'bob'],
        },
      },
    ]

    const balances = calculateParticipantBalances(expenses)

    expect(balances.get('alice')).toBe(175)
    expect(balances.get('bob')).toBe(-175)
    expect(sumAllBalances(balances)).toBe(0)
  })

  it('asserts the exact residual left by independently-rounded per-expense conversions', () => {
    const expenses: Expense[] = [
      {
        id: 'expense-1',
        payerId: 'alice',
        amountMinorUnits: 100,
        exchangeRateToBase: 0.335,
        splitMethod: {
          kind: 'equal',
          participantIds: ['alice', 'bob', 'carol'],
        },
      },
    ]

    const balances = calculateParticipantBalances(expenses)

    expect(balances.get('alice')).toBe(23)
    expect(balances.get('bob')).toBe(-11)
    expect(balances.get('carol')).toBe(-11)
    expect(sumAllBalances(balances)).toBe(1)
  })
})
