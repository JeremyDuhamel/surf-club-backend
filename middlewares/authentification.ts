import { Request, Response, NextFunction } from "express";
import { JWT_REGEX, PRIVATE_KEY } from "../constants";
import { verify } from "jsonwebtoken";

export function authentificationMiddleware(request: Request, response: Response, next: NextFunction) {
  const { authorization } = request.headers
  if (!authorization){
    return response.status(401).send("No token provided.")
  }

  const parts = authorization.split(" ")

  if(parts.length !== 2){
    return response.status(401).send("Token error.")
  }

  const [scheme, token] = parts

  if (!JWT_REGEX.test(scheme)) {
    return response.status(401).send('Token malformatted')
  }

  verify(token, PRIVATE_KEY, (error) => {
    if (error) {
      return response.status(401).send('Invalid Token')
    }
    return next()
  })
}