import type { ParticipantId, Expense, Participant } from './types'
import { splitExpense } from './splitting'

export type { Expense, Participant }

export const calculateParticipantBalances = (
  expenses: Expense[],
): Map<ParticipantId, number> => {
  const expensesWithShares = expenses.map((expense) => ({
    expense,
    shares: splitExpense(expense.amountMinorUnits, expense.splitMethod),
  }))

  const allParticipantIds = new Set<ParticipantId>()
  for (const { expense, shares } of expensesWithShares) {
    allParticipantIds.add(expense.payerId)
    for (const participantId of shares.keys()) {
      allParticipantIds.add(participantId)
    }
  }

  const balanceByParticipantId = new Map<ParticipantId, number>(
    Array.from(allParticipantIds, (participantId) => [participantId, 0]),
  )

  for (const { expense, shares } of expensesWithShares) {
    balanceByParticipantId.set(
      expense.payerId,
      balanceByParticipantId.get(expense.payerId)! + expense.amountMinorUnits,
    )

    for (const [participantId, shareMinorUnits] of shares) {
      balanceByParticipantId.set(
        participantId,
        balanceByParticipantId.get(participantId)! - shareMinorUnits,
      )
    }
  }

  return balanceByParticipantId
}
