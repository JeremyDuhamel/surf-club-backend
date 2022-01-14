import { Response } from 'express'
import { createReservation, reservation, reservationFromImcomplete, ReservationValue } from '../model/reservation'

export type UpdateRequest = { body: { id: string; input: Partial<ReservationValue> } }
export type Update = (request: UpdateRequest, response: Response) => Promise<Response>

export type DeleteRequest = { body: { id: string } }
export type Delete = (request: UpdateRequest, response: Response) => Promise<Response>

export type StoreRequest = { body: ReservationValue }
export type Store = (request: StoreRequest, response: Response) => Promise<Response>

export type ListFilters = { userId: string }
export type ListRequest = { body: ListFilters }
export type List = (request: ListRequest, response: Response) => Promise<Response>

export function reservationController() {
  const { update, archive, create, findAll } = reservation()

  return {
    // TODO: This method must be on a user-reservation-controller
    async list(request: ListRequest, response: Response) {
      const { userId } = request.body

      return findAll({ userId })
        .catch((error) => {
          return response.status(400).send(error)
        })
        .then((result) => {
          return response.status(200).json(result)
        })
    },
    async update(request: UpdateRequest, response: Response) {
      const { id, input } = request.body

      if (!id) {
        throw new Error('The id field is mandatory')
      }

      if (input?.userId) {
        return response.status(406).send('The user id cannot be updated here')
      }

      return update(id, input)
        .catch((error) => {
          return response.status(400).send(error)
        })
        .then((_result) => {
          return response.status(201).send('Reservation updated successfully')
        })
    },

    async archive(request: DeleteRequest, response: Response) {
      const { id } = request.body

      if (!id) {
        throw new Error('The id field is mandatory')
      }

      return archive(id)
        .catch((error) => {
          return response.status(400).send(error)
        })
        .then((_result) => {
          return response.status(201).send('Reservation archived successfully')
        })
    },

    async store(request: StoreRequest, response: Response) {
      const { body: input } = request
      const reservation = reservationFromImcomplete(createReservation(input))

      if (!reservation) {
        return response.status(406).send('The informations sent is not valid.')
      }

      return create(reservation)
        .catch((error) => {
          return response.status(400).send(error)
        })
        .then((_result) => {
          return response.status(201).send('Reservation created successfully.')
        })
    },
  }
}
