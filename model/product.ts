import { v4 as uuid } from 'uuid'

import { database } from '../database'

export type ProductSqlView = {
  id: string
  created_at: number
  updated_at: number
  archived_at: number | null
  name: string
  type: string
  weight: number
  size: string
  price: number
  status: string // TODO: It has to be an enum or a boolean
  in_stock: number
  fk_shop_id: string
}

export type Product = {
  id: string
  createdAt: number
  updatedAt: number
  archivedAt: number | null
  name: string
  type: string
  weight: number
  size: string
  price: number
  status: string
  inStock: number
  shopId: string
}

export type ProductId = Pick<Product, 'id'>

export type ProductMetaData = Pick<Product, 'createdAt' | 'updatedAt' | 'archivedAt'>

export type ProductValue = Omit<Product, keyof (ProductId & ProductMetaData)>

export function createProduct(value: ProductValue): Product {
  const { inStock, name, price, shopId, size, status, type, weight } = value

  const currentTimestamp = Date.now()

  return {
    id: uuid(),
    archivedAt: null,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
    name,
    price,
    shopId,
    size,
    status,
    type,
    weight,
    inStock,
  }
}

export function productFromImcomplete(incomplete: Partial<Product>): Product | null {
  const { id, archivedAt, createdAt, updatedAt, name, price, shopId, size, status, type, weight, inStock } = incomplete

  if (!id) return null
  if (!createdAt) return null
  if (!updatedAt) return null
  if (!price) return null
  if (!shopId) return null
  if (!name) return null
  if (!size) return null
  if (!status) return null
  if (!weight) return null
  if (!type) return null
  if (!inStock) return null

  return {
    id,
    archivedAt: archivedAt ?? null,
    createdAt,
    updatedAt,
    inStock,
    price,
    shopId,
    size,
    status,
    type,
    weight,
    name,
  }
}

export function productToSqlView({
  id,
  archivedAt,
  createdAt,
  updatedAt,
  inStock,
  name,
  price,
  shopId,
  size,
  status,
  type,
  weight,
}: Product): ProductSqlView {
  return {
    id,
    archived_at: archivedAt ? archivedAt : null,
    created_at: createdAt,
    updated_at: updatedAt,
    name,
    fk_shop_id: shopId,
    in_stock: inStock,
    price,
    size,
    status,
    type,
    weight,
  }
}

export function productFromSqlView(view: ProductSqlView | undefined): Product | null {
  if (!view) return null

  const { id, name, archived_at, created_at, updated_at, fk_shop_id, in_stock, price, size, status, type, weight } =
    view

  return {
    id,
    createdAt: created_at,
    updatedAt: updated_at,
    archivedAt: archived_at ? archived_at : null,
    inStock: in_stock,
    name,
    price,
    shopId: fk_shop_id,
    size,
    status,
    type,
    weight,
  }
}

export function product() {
  return {
    async create(input: Product) {
      return await database('products').insert(productToSqlView(input))
    },
    async findAll() {
      return await database<ProductSqlView>('produtcs').select('*')
        .then((result)=> {
          return result.map(productFromSqlView)
        })
    },
    async findById(id: string) {
      if (!id) {
        throw new Error('Id is not valid')
      }

      return database<ProductSqlView>('products').select('*').where('id', id).first().then(productFromSqlView)
    },
  }
}
