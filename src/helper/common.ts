export function getRoleByCode(code: string): 'user' | 'evaluator' {
  if (code.startsWith('EVAL')) return 'evaluator'
  if (code.startsWith('NJA')) return 'user'
  return 'user'
}