import { v4 as uuid } from 'uuid'

import { database } from '../database'

export type UserSqlView = {
  id: string
  created_at: number
  updated_at: number
  archived_at: number | null
  last_name: string
  first_name: string
  mail: string
  phone_number: string
  password: string
  fk_shop_id: string | null
}

export type User = {
  id: string
  createdAt: number
  updatedAt: number
  archivedAt: number | null
  lastName: string
  firstName: string
  mail: string
  phoneNumber: string
  password: string
  shopId: string | null
}

export type UserId = Pick<User, 'id'>

export type UserMetaData = Pick<User, 'createdAt' | 'updatedAt' | 'archivedAt'>

export type UserValue = Omit<User, keyof (UserId & UserMetaData)>

export function createUser(value: UserValue): User {
  const { firstName, lastName, mail, password, phoneNumber, shopId } = value

  const currentTimestamp = Date.now()

  return {
    id: uuid(),
    archivedAt: null,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
    firstName,
    lastName,
    mail,
    password,
    phoneNumber,
    shopId,
  }
}

export function userFromImcomplete(incomplete: Partial<User>): User | null {
  const { archivedAt, createdAt, firstName, id, lastName, mail, password, phoneNumber, updatedAt, shopId } = incomplete

  if (!id) return null
  if (!createdAt) return null
  if (!updatedAt) return null
  if (!lastName) return null
  if (!firstName) return null
  if (!mail) return null
  if (!password) return null
  if (!phoneNumber) return null
  if (!shopId) return null

  return {
    id,
    archivedAt: archivedAt ?? null,
    createdAt,
    firstName,
    lastName,
    mail,
    password,
    phoneNumber,
    shopId,
    updatedAt,
  }
}

export function editUser(entity: User, edition: Partial<UserValue>): User {
  const currentTimestamp = Date.now()
  const noEdit = Object.keys(edition).length === 0

  return {
    ...entity,
    ...edition,
    updatedAt: noEdit ? entity.updatedAt : currentTimestamp,
  }
}

export function userToSqlView({
  archivedAt,
  createdAt,
  firstName,
  id,
  lastName,
  mail,
  password,
  phoneNumber,
  shopId,
  updatedAt,
}: User): UserSqlView {
  return {
    id,
    archived_at: archivedAt ? archivedAt : null,
    created_at: createdAt,
    first_name: firstName,
    fk_shop_id: shopId,
    last_name: lastName,
    mail,
    password,
    phone_number: phoneNumber,
    updated_at: updatedAt,
  }
}

export function userFromSqlView(view: UserSqlView | undefined): User | null {
  if (!view) return null

  const { archived_at, created_at, first_name, id, last_name, mail, password, phone_number, updated_at, fk_shop_id } =
    view

  return {
    id,
    createdAt: created_at,
    updatedAt: updated_at,
    archivedAt: archived_at ? archived_at : null,
    firstName: first_name,
    lastName: last_name,
    mail,
    password,
    phoneNumber: phone_number,
    shopId: fk_shop_id,
  }
}

export function user() {
  return {
    async findByMail(mail: string): Promise<User | null> {
      const users = await database<UserSqlView>('users').select('*').where('mail', mail)

      switch (users.length) {
        case 0:
          return null
        case 1:
          return userFromSqlView(users[0])
        default:
          throw new Error('More than one user was found.')
      }
    },
    async create(input: User) {
      const { mail, firstName, lastName, phoneNumber } = input

      const users = await database<UserSqlView>('users')
        .select('*')
        .where(function () {
          this.where('mail', mail).andWhere('first_name', firstName).andWhere('last_name', lastName)
        })
        .orWhere(function () {
          this.where('phone_number', phoneNumber).andWhere('first_name', firstName).andWhere('last_name', lastName)
        })

      switch (users.length) {
        case 0:
          return await database('users').insert(userToSqlView(input))
        default:
          throw new Error('This user already exists on our records.')
      }
    },
    async update(id: string, input: Partial<UserValue>) {
      const user = await database<UserSqlView>('users').select('*').where('id', id).first().then(userFromSqlView)

      if (!user) {
        throw new Error('User not found.')
      }

      const updatedUser = userToSqlView(editUser(user, input))

      return await database('users').update(updatedUser).where('id', id)
    },
    async archive(id: string) {
      const user = await database<UserSqlView>('users').select('*').where('id', id).first()

      if (!user) {
        throw new Error('User not found.')
      }

      return await database('users').update({ archived_at: new Date() }).where('id', id)
    },
  }
}
