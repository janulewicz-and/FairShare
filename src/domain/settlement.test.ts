import { describe, it, expect } from 'vitest'
import { minimizeTransfers } from './settlement'
import type { SettlementTransfer } from './types'

const applyTransfersToBalances = (
  initialBalances: Map<string, number>,
  transfers: SettlementTransfer[],
): Map<string, number> => {
  const finalBalances = new Map(initialBalances)
  for (const transfer of transfers) {
    finalBalances.set(
      transfer.fromParticipantId,
      (finalBalances.get(transfer.fromParticipantId) ?? 0) + transfer.amountMinorUnits,
    )
    finalBalances.set(
      transfer.toParticipantId,
      (finalBalances.get(transfer.toParticipantId) ?? 0) - transfer.amountMinorUnits,
    )
  }
  return finalBalances
}

describe('minimizeTransfers()', () => {
  it('produces no transfers when every balance is already zero', () => {
    const balances = new Map([
      ['alice', 0],
      ['bob', 0],
    ])
    expect(minimizeTransfers(balances)).toEqual([])
  })

  it('produces a single transfer for a simple two-person debt', () => {
    const balances = new Map([
      ['alice', 500],
      ['bob', -500],
    ])
    const transfers = minimizeTransfers(balances)
    expect(transfers).toEqual([
      { fromParticipantId: 'bob', toParticipantId: 'alice', amountMinorUnits: 500 },
    ])
  })

  it('settles a chain of three or more participants to zero', () => {
    const balances = new Map([
      ['alice', 300],
      ['bob', 0],
      ['carol', -300],
    ])
    const transfers = minimizeTransfers(balances)
    const finalBalances = applyTransfersToBalances(balances, transfers)
    for (const balance of finalBalances.values()) {
      expect(balance).toBe(0)
    }
  })

  it('produces fewer transfers than naive pairwise settlement', () => {
    const balances = new Map([
      ['alice', 1000],
      ['bob', -400],
      ['carol', -600],
    ])
    const transfers = minimizeTransfers(balances)
    expect(transfers.length).toBe(2)
    const finalBalances = applyTransfersToBalances(balances, transfers)
    for (const balance of finalBalances.values()) {
      expect(balance).toBe(0)
    }
  })

  it('settles a larger group so every applied balance reaches zero', () => {
    const balances = new Map([
      ['alice', 700],
      ['bob', 200],
      ['carol', -500],
      ['dave', -100],
      ['erin', -300],
    ])
    const transfers = minimizeTransfers(balances)
    const finalBalances = applyTransfersToBalances(balances, transfers)
    for (const balance of finalBalances.values()) {
      expect(balance).toBe(0)
    }
  })

  it('throws when the balances do not sum to zero', () => {
    const balances = new Map([
      ['alice', 500],
      ['bob', -300],
    ])
    expect(() => minimizeTransfers(balances)).toThrow()
  })
})
