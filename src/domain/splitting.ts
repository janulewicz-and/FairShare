export type ParticipantId = string

export type SplitMethod =
  | { kind: 'equal'; participantIds: ParticipantId[] }
  | { kind: 'exactAmounts'; amountByParticipantId: Map<ParticipantId, number> }

const splitEqually = (
  totalMinorUnits: number,
  participantIds: ParticipantId[],
): Map<ParticipantId, number> => {
  if (participantIds.length === 0) {
    throw new Error('Cannot split an expense among zero participants')
  }

  const participantCount = participantIds.length
  const baseShareMinorUnits = Math.trunc(totalMinorUnits / participantCount)
  const remainderMinorUnits = Math.abs(totalMinorUnits % participantCount)
  const extraMinorUnit = totalMinorUnits >= 0 ? 1 : -1

  return new Map(
    participantIds.map((participantId, index) => [
      participantId,
      index < remainderMinorUnits
        ? baseShareMinorUnits + extraMinorUnit
        : baseShareMinorUnits,
    ]),
  )
}

const splitByExactAmounts = (
  totalMinorUnits: number,
  amountByParticipantId: Map<ParticipantId, number>,
): Map<ParticipantId, number> => {
  for (const shareMinorUnits of amountByParticipantId.values()) {
    if (!Number.isInteger(shareMinorUnits)) {
      throw new Error(
        `Exact amount shares must be integers in minor units, got ${shareMinorUnits}`,
      )
    }
  }

  const providedTotal = Array.from(amountByParticipantId.values()).reduce(
    (runningTotal, share) => runningTotal + share,
    0,
  )

  if (providedTotal !== totalMinorUnits) {
    throw new Error(
      `Exact amounts sum to ${providedTotal} but expense total is ${totalMinorUnits}`,
    )
  }

  return new Map(amountByParticipantId)
}

export const splitExpense = (
  totalMinorUnits: number,
  splitMethod: SplitMethod,
): Map<ParticipantId, number> => {
  if (splitMethod.kind === 'equal') {
    return splitEqually(totalMinorUnits, splitMethod.participantIds)
  }
  return splitByExactAmounts(totalMinorUnits, splitMethod.amountByParticipantId)
}
