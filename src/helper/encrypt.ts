import bcrypt from 'bcrypt'

export const encrypt = async (value: string) => {
  return await bcrypt.hash(value, 10)
}

export const compareValue = async (value: string, encryptValue: string) => {
  return await bcrypt.compare(value, encryptValue)
}
