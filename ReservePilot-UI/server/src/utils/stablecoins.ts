export const STABLECOIN_SYMBOLS = new Set(['USDC', 'USDT', 'DAI', 'PYUSD', 'USDP', 'FDUSD', 'TUSD', 'USDD']);

export const isStablecoin = (symbol: string, manualValue?: boolean, manuallyClassified = false) =>
  manuallyClassified ? Boolean(manualValue) : STABLECOIN_SYMBOLS.has(symbol.toUpperCase());
