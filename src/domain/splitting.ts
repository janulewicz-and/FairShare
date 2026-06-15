export type ParticipantId = string

export type SplitMethod =
  | { kind: 'equal'; participantIds: ParticipantId[] }
  | { kind: 'exactAmounts'; amountByParticipantId: Map<ParticipantId, number> }

const splitEqually = (
  totalMinorUnits: number,
  participantIds: ParticipantId[],
): Map<ParticipantId, number> => {
  const participantCount = participantIds.length
  const baseShareMinorUnits = Math.floor(totalMinorUnits / participantCount)
  const remainderMinorUnits = totalMinorUnits % participantCount

  return new Map(
    participantIds.map((participantId, index) => [
      participantId,
      index < remainderMinorUnits
        ? baseShareMinorUnits + 1
        : baseShareMinorUnits,
    ]),
  )
}

const splitByExactAmounts = (
  totalMinorUnits: number,
  amountByParticipantId: Map<ParticipantId, number>,
): Map<ParticipantId, number> => {
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
