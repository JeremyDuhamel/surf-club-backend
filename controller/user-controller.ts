import { Response } from 'express'
import { EMAIL_REGEX } from '../constants'

import { user, UserValue } from '../model/user'

export type UpdateRequest = { body: { id: string; input: Partial<UserValue> } }

export type Update = (request: UpdateRequest, response: Response) => Promise<Response>

export type DeleteRequest = { body: { id: string } }

export type Delete = (request: UpdateRequest, response: Response) => Promise<Response>

export function userController() {
  const { update, archive } = user()

  return {
    async update(request: UpdateRequest, response: Response) {
      const { id, input } = request.body // TODO: Id can come on the request params

      if (!id) {
        throw new Error('The id field is mandatory')
      }

      if (input?.password) {
        return response.status(406).send('The password cannot be updated here')
      }

      if (input?.mail && !EMAIL_REGEX.test(input.mail)) {
        return response.status(400).send('The email format is not valid')
      }

      return update(id, input)
        .catch((error) => {
          return response.status(400).send(error)
        })
        .then((_result) => {
          return response.status(201).send('User updated successfully')
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
          return response.status(201).send('User archived successfully')
        })
    },
  }
}
