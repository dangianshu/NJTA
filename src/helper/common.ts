export function getRoleByCode(code: string): 'user' | 'evaluator' {
  if (code.startsWith('EVAL')) return 'evaluator'
  if (code.startsWith('NJA')) return 'user'
  return 'user'
}

export function generateCustomPassword(): string {
  const upper = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const lowers = Array.from({ length: 3 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
  const specialChars = '@#$%&*!';
  const special = specialChars[Math.floor(Math.random() * specialChars.length)];
  const digits = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
  return upper + lowers + special + digits;
}

export function getTypeByCode(code: string) {
  if (code.startsWith('EVAL')) return 'Evaluator';
  if (code.startsWith('NJA')) return 'Organization';
  return 'Unknown';
}