import { genSalt, hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'

import { SALT_ROUNDS, PRIVATE_KEY } from '../constants'

export async function hashPassword(input: string): Promise<string> {
  return genSalt(SALT_ROUNDS)
    .then((salt) => hash(input, salt))
    .catch((err) => {
      throw new Error(err)
    })
}

export async function comparePassword(input: string, password: string): Promise<boolean> {
  return compare(input, password)
}

export function createToken(data: { id: string; mail: string }): string {
  return sign(data, PRIVATE_KEY, { expiresIn: '6h' })
}
