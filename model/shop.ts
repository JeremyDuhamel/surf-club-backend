import { v4 as uuid } from 'uuid'

import { database } from '../database'

export type ShopSqlView = {
  id: string
  created_at: number
  updated_at: number
  archived_at: number | null
  name: string
  logo: string | null
  address: string
  postal_code: string
  city: string
  country: string
  mail: string
  phone_number: string
  website: string | null
}

export type Shop = {
  id: string
  createdAt: number
  updatedAt: number
  archivedAt: number | null
  name: string
  logo: string | null
  address: string
  postalCode: string
  city: string
  country: string
  mail: string
  phoneNumber: string
  website: string | null
}

export type ShopId = Pick<Shop, 'id'>

export type ShopMetaData = Pick<Shop, 'createdAt' | 'updatedAt' | 'archivedAt'>

export type ShopValue = Omit<Shop, keyof (ShopId & ShopMetaData)>

export function createShop(value: ShopValue): Shop {
  const { address, city, country, logo, mail, name, phoneNumber, postalCode, website } = value

  const currentTimestamp = Date.now()

  return {
    id: uuid(),
    archivedAt: null,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
    website,
    name,
    logo,
    address,
    postalCode,
    city,
    country,
    mail,
    phoneNumber,
  }
}

export function shopFromImcomplete(incomplete: Partial<Shop>): Shop | null {
  const {
    archivedAt,
    createdAt,
    address,
    id,
    logo,
    mail,
    name,
    city,
    phoneNumber,
    updatedAt,
    website,
    postalCode,
    country,
  } = incomplete

  if (!id) return null
  if (!createdAt) return null
  if (!updatedAt) return null
  if (!address) return null
  if (!mail) return null
  if (!name) return null
  if (!city) return null
  if (!postalCode) return null
  if (!country) return null
  if (!phoneNumber) return null

  return {
    id,
    archivedAt: archivedAt ?? null,
    createdAt,
    city,
    address,
    country,
    logo: logo ?? null,
    name,
    postalCode,
    website: website ?? null,
    mail,
    phoneNumber,
    updatedAt,
  }
}

export function shopToSqlView({
  archivedAt,
  createdAt,
  website,
  id,
  address,
  mail,
  postalCode,
  city,
  country,
  logo,
  name,
  phoneNumber,
  updatedAt,
}: Shop): ShopSqlView {
  return {
    id,
    archived_at: archivedAt ? archivedAt : null,
    created_at: createdAt,
    name,
    address,
    country,
    logo,
    city,
    mail,
    website,
    postal_code: postalCode,
    phone_number: phoneNumber,
    updated_at: updatedAt,
  }
}

export function shopFromSqlView(view: ShopSqlView | null): Shop | null {
  if (!view) return null

  const {
    archived_at,
    created_at,
    name,
    address,
    city,
    postal_code,
    id,
    logo,
    mail,
    country,
    website,
    phone_number,
    updated_at,
  } = view

  return {
    id,
    createdAt: created_at,
    updatedAt: updated_at,
    archivedAt: archived_at ? archived_at : null,
    address,
    city,
    country,
    logo,
    name,
    postalCode: postal_code,
    phoneNumber: phone_number,
    website,
    mail,
  }
}

export function shop() {
  return {
    async findByMail(mail: string): Promise<Shop | null> {
      const shops = await database<ShopSqlView>('shops').select('*').where('mail', mail)

      switch (shops.length) {
        case 0:
          return null
        case 1:
          return shopFromSqlView(shops[0])
        default:
          throw new Error('More than one shop was found.')
      }
    },
    async findAll() {
      return await database<ShopSqlView>('shops').select('*')
        .then((result)=> {
          return result.map(shopFromSqlView)
        })
    },
    async create(input: Shop) {
      const { mail, phoneNumber } = input

      const shops = await database<ShopSqlView>('shops')
        .select('*')
        .where('mail', mail)
        .orWhere('phone_number', phoneNumber)

      switch (shops.length) {
        case 0:
          return await database('shops').insert(shopToSqlView(input))
        default:
          throw new Error('This shop already exists on our records.')
      }
    },
  }
}
