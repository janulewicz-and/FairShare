export const convertToBase = (
  amountMinorUnits: number,
  exchangeRateToBase: number,
): number => {
  if (!Number.isInteger(amountMinorUnits)) {
    throw new Error(
      `Amount must be an integer in minor units, got ${amountMinorUnits}`,
    )
  }
  if (!Number.isFinite(exchangeRateToBase) || exchangeRateToBase <= 0) {
    throw new Error(
      `Exchange rate must be a positive finite number, got ${exchangeRateToBase}`,
    )
  }
  const rawConvertedAmount = amountMinorUnits * exchangeRateToBase
  const amountWithoutFloatingPointNoise =
    Math.round(rawConvertedAmount * 1e9) / 1e9
  return Math.round(amountWithoutFloatingPointNoise)
}
