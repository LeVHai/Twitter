import { Router } from "express";
import { accessTokenValidate, isUserLoginValidator, verifyUserValidator } from "../middlewares/userMidleware.js";
import { wrapHandleError } from "../utils/handles.js";
import { createTweetController, getTweetChildrenController, getTweetController } from "../controllers/tweetsController.js";
import { audienceValidator, createTweetValidator, getTweetChildrenValidator, tweetIdValidator } from "../middlewares/tweetsMidlleware.js";
const tweetsRouter = Router()
/**
 * Description: Create tweet
 * Path: /
 * Method : Post
 * Body: Tweet request body
 */
tweetsRouter.post('/',accessTokenValidate,createTweetValidator,wrapHandleError(createTweetController))
tweetsRouter.get('/:tweet_id',tweetIdValidator,isUserLoginValidator(accessTokenValidate),isUserLoginValidator(verifyUserValidator),audienceValidator,wrapHandleError(getTweetController))
/**
 * Description: Get Tweet children
 * Path : /:tweet_id/children
 * Method : Get
 * Header: {Authorization: Bearer<access_token>}
 * Query:{limit, page, tweet_type}
 */
tweetsRouter.get('/:tweet_id/children',tweetIdValidator,isUserLoginValidator(accessTokenValidate),isUserLoginValidator(verifyUserValidator),audienceValidator,getTweetChildrenValidator,wrapHandleError(getTweetChildrenController))

export default tweetsRouter
