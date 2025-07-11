import { Response } from 'express'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  timestamp: string
}

export class ResponseHelper {
  private static createResponse<T>(
    success: boolean,
    message: string,
    data?: T,
    error?: string
  ): ApiResponse<T> {
    return {
      success,
      message,
      data,
      error,
      timestamp: new Date().toISOString(),
    }
  }

  static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
    return res.status(statusCode).json(
      this.createResponse(true, message, data)
    )
  }

  static error(res: Response, message: string, error?: string, statusCode: number = 500): Response {
    return res.status(statusCode).json(
      this.createResponse(false, message, undefined, error)
    )
  }

  static badRequest(res: Response, message: string, error?: string): Response {
    return this.error(res, message, error, 400)
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, undefined, 401)
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, undefined, 403)
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, undefined, 404)
  }

  static conflict(res: Response, message: string, error?: string): Response {
    return this.error(res, message, error, 409)
  }

  static validationError(res: Response, message: string, validationErrors?: any): Response {
    return res.status(422).json(
      this.createResponse(false, message, undefined, validationErrors)
    )
  }
}

export default ResponseHelper 