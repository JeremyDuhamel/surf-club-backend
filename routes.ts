import express from "express";
import { authenticationController } from "./controller/authentication-controller";
import { authentificationMiddleware } from "./middlewares/authentification";
import { shopController } from "./controller/shop-controller"
import { productController } from "./controller/product-controller";
import { userController } from './controller/user-controller'
import { reservationController } from './controller/reservation-controller'
import { database } from './database'

export const routes = express.Router()

routes.get('/', async (_request, response) => {
  response.send('Service available.')
})

const { register, login, forgotPassword } = authenticationController()
const { store: storeShop, list: listShop } = shopController()
const { store: storeProduct, list: listProduct } = productController()
const { update: updateUser, archive: archiveUser } = userController()
const {
  store: storeReservation,
  update: updateReservation,
  archive: archiveReservation,
  list: listReservation,
} = reservationController()

// Authentication routes
routes.post('/user/register', register)
routes.post('/user/login', login)
routes.post('/user/forgot-password', forgotPassword)

// Shop routes
routes.post('/shop/create', storeShop)
routes.get('/shop/list', listShop)

// Product routes
routes.post('/product/create', authentificationMiddleware, storeProduct)
routes.get('/product/list', listProduct)

// User routes
routes.post('/user/update', authentificationMiddleware, updateUser) // TODO: It can be a put, patch, etc...
routes.post('/user/archive', authentificationMiddleware, archiveUser)

// Reservation routes
routes.post('/reservation/create', authentificationMiddleware, storeReservation)
routes.post('/reservation/update', authentificationMiddleware, updateReservation)
routes.post('/reservation/archive', authentificationMiddleware, archiveReservation)
routes.post('/reservation/list', authentificationMiddleware, listReservation)
