export const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));
export const assetValue = (quantity: number, priceUsd: number) => quantity * priceUsd;
export const targetReserve = (monthlyExpenses: number, months: number) => monthlyExpenses * months;
export const firstMonthCashNeed = (monthlyExpenses: number, oneTimeExpenses: number) => monthlyExpenses + oneTimeExpenses;
