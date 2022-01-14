import { createProduct, product, productFromImcomplete, ProductValue } from '../model/product'
import { Request, Response } from 'express'

export type StoreRequest = { body: ProductValue }

export type Store = (request: StoreRequest, response: Response) => Promise<Response>

export function productController() {
  const { create, findAll } = product()

  return {
    async list(request: Request, response: Response) {
      return findAll()
        .catch((error) => {
          return response.status(400).send(error)
        })
        .then((result) => {
          return response.status(200).json(result)
        })
    },
    async store(request: StoreRequest, response: Response) {
      const { body: input } = request
      const product = productFromImcomplete(createProduct(input))

      if (!product) {
        return response.status(406).send('The informations sent is not valid')
      }

      return create(product)
        .catch((error) => {
          return response.status(400).send(error)
        })
        .then((_result) => {
          return response.status(201).send('Product created successfully')
        })
    },
  }
}
