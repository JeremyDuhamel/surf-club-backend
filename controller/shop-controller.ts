import { ShopValue, shop, createShop, shopFromImcomplete } from "../model/shop";
import { Request, Response } from "express";
import { EMAIL_REGEX } from "../constants"

export type StoreRequest = { body: ShopValue }

export type Store = (request: StoreRequest, response: Response) => Promise<Response>

export function shopController() {
  const { create, findAll } = shop()

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
      const shop = shopFromImcomplete(createShop(input))

      if (!shop) {
        return response.status(406).send('The informations sent is not valid')
      }

      if (!EMAIL_REGEX.test(shop.mail)) {
        return response.status(400).send('The email format is not valid')
      }

      return create(shop)
        .catch((error) => {
          return response.status(400).send(error)
        })
        .then((_result) => {
          return response.status(201).send('Shop created successfully')
        })
    },
  }
}