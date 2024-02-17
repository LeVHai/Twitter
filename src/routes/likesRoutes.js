 
import { Router } from "express";
import { accessTokenValidate, verifyUserValidator } from "../middlewares/userMidleware.js";
import { wrapHandleError } from "../utils/handles.js";
import { likesController, unlikesController } from "../controllers/likesController.js";
import { tweetIdValidator } from "../middlewares/tweetsMidlleware.js";
const likesRouter = Router()
likesRouter.post('/',accessTokenValidate,tweetIdValidator,wrapHandleError(likesController))
likesRouter.delete('/:tweet_id',accessTokenValidate,tweetIdValidator,wrapHandleError(unlikesController))

export default likesRouter