export function validateISBN(isbn: string): boolean {
  if (!isbn) return false;
  
  // Remove hyphens and spaces
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  // Check if it's 10 or 13 digits
  if (!/^\d{10}$/.test(cleanISBN) && !/^\d{13}$/.test(cleanISBN)) {
    return false;
  }
  
  if (cleanISBN.length === 10) {
    return validateISBN10(cleanISBN);
  } else {
    return validateISBN13(cleanISBN);
  }
}

function validateISBN10(isbn: string): boolean {
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }
  
  const checkDigit = isbn[9];
  const remainder = sum % 11;
  const expectedCheckDigit = remainder === 0 ? '0' : remainder === 1 ? 'X' : (11 - remainder).toString();
  
  return checkDigit.toUpperCase() === expectedCheckDigit;
}

function validateISBN13(isbn: string): boolean {
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  
  const checkDigit = parseInt(isbn[12]);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  
  return checkDigit === expectedCheckDigit;
}

export function formatISBN(isbn: string): string {
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  if (cleanISBN.length === 10) {
    return `${cleanISBN.slice(0, 1)}-${cleanISBN.slice(1, 5)}-${cleanISBN.slice(5, 9)}-${cleanISBN.slice(9)}`;
  } else if (cleanISBN.length === 13) {
    return `${cleanISBN.slice(0, 3)}-${cleanISBN.slice(3, 4)}-${cleanISBN.slice(4, 8)}-${cleanISBN.slice(8, 12)}-${cleanISBN.slice(12)}`;
  }
  
  return isbn;
}
