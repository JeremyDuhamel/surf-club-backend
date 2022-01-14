import { Response } from 'express'
import nodemailer from 'nodemailer'
import generator from 'generate-password'

import { EMAIL_REGEX } from '../constants'
import { UserValue, user, userFromImcomplete, createUser } from '../model/user'

import { hashPassword, comparePassword, createToken } from '../utils'

export type RegisterRequest = {
  body: UserValue
}

export type Register = (request: RegisterRequest, response: Response) => Promise<Response>

export type LoginRequest = {
  body: { mail: string; password: string }
}

export type Login = (request: LoginRequest, response: Response) => Promise<Response>

export type ForgotPasswordRequest = {
  body: { mail: string }
}

export type ForgotPassword = (request: LoginRequest, response: Response) => Promise<Response>

export type AuthenticationController = {
  register: Register
  login: Login
  forgotPassword: ForgotPassword
}

export function authenticationController(): AuthenticationController {
  const { findByMail, create, update } = user()
  return {
    async register(request: RegisterRequest, response: Response) {
      const { body: input } = request
      const user = userFromImcomplete(createUser(input))

      if (!user) return response.status(406).send('The information sent is not valid.')

      if (!EMAIL_REGEX.test(user.mail)) {
        return response.status(400).send('The mail format is not valid')
      }

      const hashedPassword = await hashPassword(user.password)

      return create({ ...user, password: hashedPassword })
        .catch((err) => {
          return response.status(400).send(err) // TODO: translate the errors from the database
        })
        .then((_result) => {
          return response.status(201).send('Registered successfully.')
        })
    },
    async login(request: LoginRequest, response: Response) {
      const { mail, password } = request.body

      if (!EMAIL_REGEX.test(mail)) {
        return response.status(400).send('The mail format is not valid')
      }

      const user = await findByMail(mail)

      if (!user) return response.status(404).send('User not found.')

      if (user.archivedAt) return response.status(404).send('This account is not active.')

      if (!(await comparePassword(password, user.password))) return response.status(403).send('Invalid credentials.')

      const token = createToken({ id: user.id, mail: user.mail })

      return response.status(200).send({ token })
    },
    async forgotPassword(request: ForgotPasswordRequest, response: Response) {
      const { mail } = request.body
      const user = await findByMail(mail)

      if (!user) {
        return response.status(406).send('The mail sent is not valid')
      }

      const password = generator.generate({
        length: 10,
        numbers: true,
      })

      const transporter = nodemailer.createTransport({
        host: 'mail.gandi.net',
        port: 587,
        auth: {
          user: 'nodemailer@duhameljeremy.work',
          pass: 'Legislate7-Caption-Uncapped-Removed-Fool',
        },
      })

      const mailOptions = {
        from: 'nodemailer@duhameljeremy.work',
        to: mail,
        subject: 'Your new password.',
        text: 'To login to your account use the password: ' + password,
      }

      const mailPromise = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log(error)
            reject(false)
          } else {
            console.log(info)
            resolve(true)
          }
        })
      })

      if (mailPromise) {
        await update(user?.id, { password: await hashPassword(password) })
        return response.status(203).send('Password updated successfully')
      } else {
        return response.status(500).send('It was not possible to reset the password')
      }
    },
  }
}
