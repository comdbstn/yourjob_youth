export const isNumber = (value: string): boolean => {
  return !isNaN(Number(value));
}

export const getCommaSeparatedNumber = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}