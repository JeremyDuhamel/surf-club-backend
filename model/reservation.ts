import { v4 as uuid } from 'uuid'
import { database } from '../database'
import { product } from './product'

export type ReservationSqlView = {
  id: string
  created_at: number
  updated_at: number
  archived_at: number | null
  total_price: number
  start_date: number
  end_date: number
  fk_user_id: string
  fk_product_id: string
  fk_shop_id: string
}

export type Reservation = {
  id: string
  createdAt: number
  updatedAt: number
  archivedAt: number | null
  totalPrice: number
  startDate: number
  endDate: number
  userId: string
  productId: string
  shopId: string
}

export type ReservationId = Pick<Reservation, 'id'>

export type ReservationMetaData = Pick<Reservation, 'createdAt' | 'updatedAt' | 'archivedAt'>

export type ReservationValue = Omit<Reservation, keyof (ReservationId & ReservationMetaData)>

export function createReservation(value: ReservationValue): Reservation {
  const { endDate, shopId, userId, productId, startDate, totalPrice } = value

  const currentTimestamp = Date.now()

  return {
    id: uuid(),
    archivedAt: null,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
    totalPrice,
    startDate,
    endDate,
    userId,
    productId,
    shopId,
  }
}

export function reservationFromImcomplete(incomplete: Partial<Reservation>): Reservation | null {
  const { id, archivedAt, createdAt, updatedAt, totalPrice, startDate, endDate, userId, productId, shopId } = incomplete

  if (!id) return null
  if (!createdAt) return null
  if (!updatedAt) return null
  if (!totalPrice) return null
  if (!startDate) return null
  if (!endDate) return null
  if (!userId) return null
  if (!productId) return null
  if (!shopId) return null

  return {
    id,
    archivedAt: archivedAt ?? null,
    createdAt,
    updatedAt,
    totalPrice,
    startDate,
    endDate,
    userId,
    productId,
    shopId,
  }
}

export function reservationToSqlView({
  id,
  archivedAt,
  createdAt,
  updatedAt,
  totalPrice,
  startDate,
  endDate,
  userId,
  productId,
  shopId,
}: Reservation): ReservationSqlView {
  return {
    id,
    archived_at: archivedAt ? archivedAt : null,
    created_at: createdAt,
    updated_at: updatedAt,
    total_price: totalPrice,
    start_date: startDate,
    end_date: endDate,
    fk_user_id: userId,
    fk_product_id: productId,
    fk_shop_id: shopId,
  }
}

export function editReservation(entity: Reservation, edition: Partial<ReservationValue>): Reservation {
  const currentTimestamp = Date.now()
  const noEdit = Object.keys(edition).length === 0

  return {
    ...entity,
    ...edition,
    updatedAt: noEdit ? entity.updatedAt : currentTimestamp,
  }
}

export function reservationFromSqlView(view: ReservationSqlView | undefined): Reservation | null {
  if (!view) return null

  const {
    id,
    archived_at,
    created_at,
    updated_at,
    total_price,
    start_date,
    end_date,
    fk_user_id,
    fk_product_id,
    fk_shop_id,
  } = view

  return {
    id,
    createdAt: created_at,
    updatedAt: updated_at,
    archivedAt: archived_at ? archived_at : null,
    totalPrice: total_price,
    startDate: start_date,
    endDate: end_date,
    userId: fk_user_id,
    productId: fk_product_id,
    shopId: fk_shop_id,
  }
}

export type Filters = {
  userId?: string
  shopId?: string
}

export function reservation() {
  return {
    async findByUserId(userId: string) {
      return await database<ReservationSqlView>('reservations')
        .select('*')
        .where('user_id', userId)
        .then((result) => {
          return result.map(reservationFromSqlView)
        })
    },
    async findAll(filters?: Filters) {
      const { userId, shopId } = filters ?? {}

      const query = database<ReservationSqlView>('reservations').select('*')

      if (userId) {
        query.where('fk_user_id', userId)
      }

      if (shopId) {
        query.where('fk_shop_id', shopId)
      }

      return await query.then((result) => {
        return result.map(reservationFromSqlView)
      })
    },
    async create(input: Reservation) {
      const { startDate, endDate, productId } = input

      const reservations = await database<ReservationSqlView>('reservations')
        .select('*')
        .where('start_date', '>=', startDate)
        .andWhere('end_date', '<=', endDate)
        .andWhere('fk_product_id', productId)

      const { inStock } = (await product().findById(productId)) ?? {}

      if (!inStock) {
        throw new Error('Unable to get in stock value')
      }

      if (inStock - reservations.length > 0) {
        return await database('reservations').insert(reservationToSqlView(input))
      } else {
        throw new Error('No reservation available for this product.')
      }
    },
    async update(id: string, input: Partial<ReservationValue>) {
      const reservation = await database<ReservationSqlView>('reservations')
        .select('*')
        .where('id', id)
        .first()
        .then(reservationFromSqlView)

      if (!reservation) {
        throw new Error('Reservation not found.')
      }

      const updatedReservation = reservationToSqlView(editReservation(reservation, input))

      return await database('reservations').update(updatedReservation).where('id', id)
    },
    async archive(id: string) {
      const reservation = await database<ReservationSqlView>('reservations').select('*').where('id', id).first()

      if (!reservation) {
        throw new Error('Reservation not found.')
      }

      return await database('reservations').update({ archived_at: new Date() }).where('id', id)
    },
  }
}
