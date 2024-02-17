import _ from "lodash";
import { httpStatus } from "../constants/httpStatus.js";


export const defaultErrorHandler = (err, req, res, next) => {
  if(err.status){
   return res.status(err.status).json(_.omit(err,'status'));
  }
  Object.getOwnPropertyNames(err).forEach((key)=>{
    Object.defineProperty(err,key,{enumerable: true})
  })
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfor: err
  });
};
