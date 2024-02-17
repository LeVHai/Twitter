import { validationResult } from 'express-validator';
import { EntityError } from '../models/errors.js';

export const validate = validations => {
  return async (req, res, next) => {
    await validations.run(req);
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const errorObject = errors.mapped()
    const entityError = new EntityError({error : {}})
    for(const key in errorObject){
      const {msg} =errorObject[key]
      if(msg.status !== 422 && msg.status !== undefined){
      return  next(msg)
      }
      entityError.error[key] = errorObject[key]
    }
    next(entityError)
  };
};