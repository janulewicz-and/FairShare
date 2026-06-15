import type { CurrencyCode, Money } from './types'

export type { CurrencyCode, Money }

export const createMoney = (amount: number, currency: CurrencyCode): Money => {
  if (!Number.isInteger(amount)) {
    throw new Error(
      `Money amount must be an integer in minor units, got ${amount}`,
    )
  }
  return { amount, currency }
}

const assertSameCurrency = (first: Money, second: Money): void => {
  if (first.currency !== second.currency) {
    throw new Error(
      `Currency mismatch: cannot mix ${first.currency} and ${second.currency}`,
    )
  }
}

export const addMoney = (augend: Money, addend: Money): Money => {
  assertSameCurrency(augend, addend)
  return createMoney(augend.amount + addend.amount, augend.currency)
}

export const subtractMoney = (minuend: Money, subtrahend: Money): Money => {
  assertSameCurrency(minuend, subtrahend)
  return createMoney(minuend.amount - subtrahend.amount, minuend.currency)
}

export const sumMoney = (moneyList: Money[], currency: CurrencyCode): Money =>
  moneyList.reduce(
    (runningTotal, current) => addMoney(runningTotal, current),
    createMoney(0, currency),
  )
