 
import { Router } from "express";
import { accessTokenValidate, verifyUserValidator } from "../middlewares/userMidleware.js";
import { wrapHandleError } from "../utils/handles.js";
import {tweetIdValidator } from "../middlewares/tweetsMidlleware.js";
import { bookmarksController, unbookmarksController } from "../controllers/bookmarksController.js";
const bookmarksRouter = Router()
bookmarksRouter.post('/',accessTokenValidate,tweetIdValidator,wrapHandleError(bookmarksController))
bookmarksRouter.delete('/tweets/:tweet_id',accessTokenValidate,wrapHandleError(unbookmarksController))

export default bookmarksRouter