export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CNY'
  | 'AUD'
  | 'CAD'
  | 'CHF'
  | 'HKD'
  | 'SGD'
  | 'SEK'
  | 'NOK'
  | 'NZD'
  | 'MXN'
  | 'BRL'
  | 'INR'
  | 'RUB'
  | 'ZAR'
  | 'TRY'
  | 'PLN'

export interface Money {
  readonly amount: number
  readonly currency: CurrencyCode
}

export type ParticipantId = string

export type SplitMethod =
  | { kind: 'equal'; participantIds: ParticipantId[] }
  | { kind: 'exactAmounts'; amountByParticipantId: Map<ParticipantId, number> }

export interface Expense {
  readonly id: string
  readonly payerId: ParticipantId
  readonly amountMinorUnits: number
  readonly splitMethod: SplitMethod
}

export interface Participant {
  readonly id: ParticipantId
  readonly displayName: string
}

export interface SettlementTransfer {
  readonly fromParticipantId: ParticipantId
  readonly toParticipantId: ParticipantId
  readonly amountMinorUnits: number
}
