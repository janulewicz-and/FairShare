import type { ParticipantId, SettlementTransfer } from './types'

interface ParticipantBalance {
  participantId: ParticipantId
  remainingBalanceMinorUnits: number
}

const toNonZeroBalances = (
  balances: Map<ParticipantId, number>,
): ParticipantBalance[] =>
  Array.from(balances.entries())
    .filter(([, balanceMinorUnits]) => balanceMinorUnits !== 0)
    .map(([participantId, balanceMinorUnits]) => ({
      participantId,
      remainingBalanceMinorUnits: balanceMinorUnits,
    }))

const findLargestDebtor = (
  participants: ParticipantBalance[],
): ParticipantBalance | undefined =>
  participants.reduce<ParticipantBalance | undefined>(
    (largestSoFar, current) =>
      current.remainingBalanceMinorUnits < 0 &&
      (largestSoFar === undefined ||
        current.remainingBalanceMinorUnits < largestSoFar.remainingBalanceMinorUnits)
        ? current
        : largestSoFar,
    undefined,
  )

const findLargestCreditor = (
  participants: ParticipantBalance[],
): ParticipantBalance | undefined =>
  participants.reduce<ParticipantBalance | undefined>(
    (largestSoFar, current) =>
      current.remainingBalanceMinorUnits > 0 &&
      (largestSoFar === undefined ||
        current.remainingBalanceMinorUnits > largestSoFar.remainingBalanceMinorUnits)
        ? current
        : largestSoFar,
    undefined,
  )

const assertBalancesAreConserved = (
  participants: ParticipantBalance[],
): void => {
  const totalMinorUnits = participants.reduce(
    (runningTotal, participant) => runningTotal + participant.remainingBalanceMinorUnits,
    0,
  )
  if (totalMinorUnits !== 0) {
    throw new Error(
      `Balances must sum to zero before settlement, got ${totalMinorUnits}`,
    )
  }
}

export const minimizeTransfers = (
  balances: Map<ParticipantId, number>,
): SettlementTransfer[] => {
  const participants = toNonZeroBalances(balances)
  assertBalancesAreConserved(participants)
  const transfers: SettlementTransfer[] = []

  while (true) {
    const largestDebtor = findLargestDebtor(participants)
    const largestCreditor = findLargestCreditor(participants)

    if (largestDebtor === undefined || largestCreditor === undefined) {
      break
    }

    const debtorOwesMinorUnits = -largestDebtor.remainingBalanceMinorUnits
    const creditorIsOwedMinorUnits = largestCreditor.remainingBalanceMinorUnits
    const transferAmountMinorUnits = Math.min(
      debtorOwesMinorUnits,
      creditorIsOwedMinorUnits,
    )

    transfers.push({
      fromParticipantId: largestDebtor.participantId,
      toParticipantId: largestCreditor.participantId,
      amountMinorUnits: transferAmountMinorUnits,
    })

    largestDebtor.remainingBalanceMinorUnits += transferAmountMinorUnits
    largestCreditor.remainingBalanceMinorUnits -= transferAmountMinorUnits
  }

  return transfers
}
