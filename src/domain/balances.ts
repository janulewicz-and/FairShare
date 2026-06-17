import type { ParticipantId, Expense, Participant } from './types'
import { splitExpense } from './splitting'
import { convertToBase } from './conversion'

export type { Expense, Participant }

const convertSharesToBaseCurrency = (
  sharesInExpenseCurrency: Map<ParticipantId, number>,
  exchangeRateToBase: number,
): Map<ParticipantId, number> =>
  new Map(
    Array.from(sharesInExpenseCurrency, ([participantId, shareMinorUnits]) => [
      participantId,
      convertToBase(shareMinorUnits, exchangeRateToBase),
    ]),
  )

export const calculateParticipantBalances = (
  expenses: Expense[],
): Map<ParticipantId, number> => {
  const expensesWithConvertedAmounts = expenses.map((expense) => {
    const sharesInExpenseCurrency = splitExpense(
      expense.amountMinorUnits,
      expense.splitMethod,
    )
    return {
      expense,
      paidAmountInBaseCurrency: convertToBase(
        expense.amountMinorUnits,
        expense.exchangeRateToBase,
      ),
      sharesInBaseCurrency: convertSharesToBaseCurrency(
        sharesInExpenseCurrency,
        expense.exchangeRateToBase,
      ),
    }
  })

  const allParticipantIds = new Set<ParticipantId>()
  for (const { expense, sharesInBaseCurrency } of expensesWithConvertedAmounts) {
    allParticipantIds.add(expense.payerId)
    for (const participantId of sharesInBaseCurrency.keys()) {
      allParticipantIds.add(participantId)
    }
  }

  const balanceByParticipantId = new Map<ParticipantId, number>(
    Array.from(allParticipantIds, (participantId) => [participantId, 0]),
  )

  for (const {
    expense,
    paidAmountInBaseCurrency,
    sharesInBaseCurrency,
  } of expensesWithConvertedAmounts) {
    balanceByParticipantId.set(
      expense.payerId,
      balanceByParticipantId.get(expense.payerId)! + paidAmountInBaseCurrency,
    )

    for (const [participantId, shareMinorUnits] of sharesInBaseCurrency) {
      balanceByParticipantId.set(
        participantId,
        balanceByParticipantId.get(participantId)! - shareMinorUnits,
      )
    }
  }

  return balanceByParticipantId
}
