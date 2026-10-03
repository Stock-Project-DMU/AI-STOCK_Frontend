export function formatAccountNumber(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length !== 12) return accountNumber;

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
