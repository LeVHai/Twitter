import {Router} from 'express'
import { changePasswordController, emailVerifyController, followController, forgotPasswordController, getMeController, loginController, logoutController, refreshTokenController, registerController, resendVerifyController, unfollowController, updateMeController, verifyForgotPasswordTokenController } from '../controllers/usersController.js'
import { accessTokenValidate, changePasswordValidator, emailVerifyTokenValidator, followValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, registerValidator, unfollowValidator, upDateMeValidator, verifyForgotPasswordTokenValidator, verifyUserValidator } from '../middlewares/userMidleware.js'
import { wrapHandleError } from '../utils/handles.js'
const usersRouter = Router()
/*
Description Login a user
Path: /login
Method: Post 
Body: {email, password}
*/
usersRouter.post('/login',loginValidator,wrapHandleError(loginController))
/*
Description: Register a new user
Path: /register
Method: Post 
Body: {name,email, password, confirm password, date of birth}
*/
usersRouter.post('/register',registerValidator,wrapHandleError(registerController))
/*
Description: Logout a new user
Path: /logout
Method: Post 
Header :{Authorization: Bearer <access-token>}
Body: {refresh_token}
*/
usersRouter.post('/logout',accessTokenValidate,refreshTokenValidator,wrapHandleError(logoutController))

usersRouter.post('/refresh-token',refreshTokenValidator,wrapHandleError(refreshTokenController))

/*
Description: Verify email when user client click on the link email
Path: /verify_email
Method: Post 
Body: {email_verify_token}
*/
usersRouter.post('/verify-email',emailVerifyTokenValidator,wrapHandleError(emailVerifyController))
/*
Description: Verify email when user client click on the link email
Path: /resend-verify-email
Method: Post 
Body: {email_verify_token}
*/
usersRouter.post('/resend-verify',accessTokenValidate,wrapHandleError(resendVerifyController))
/*
Description:Submit email to reset password ,sen email to user
Path: /forgot-password
Method: Post
Body:{email}
*/
usersRouter.post('/forgot-password',forgotPasswordValidator,wrapHandleError(forgotPasswordController))
/*
Description: Verify link in email to reset password
Path: /verify-forgot-password
Method: Post
Body:{forgot_password_token}
*/
usersRouter.post('/verify-forgot-password',verifyForgotPasswordTokenValidator,wrapHandleError(verifyForgotPasswordTokenController))


usersRouter.post('/change-password',accessTokenValidate,changePasswordValidator,wrapHandleError(changePasswordController))


/*
Description: Get my profile
Path: /me
Method: GET
Header :{Authorization: Bearer <access-token>}
*/ 
usersRouter.get('/me',accessTokenValidate,wrapHandleError(getMeController))
/*
Description: Get my profile
Path: /me
Method: PATCH
Header :{Authorization: Bearer <access-token>}
Body : UserSchema
*/ 
usersRouter.patch('/me',accessTokenValidate,upDateMeValidator,wrapHandleError(updateMeController))
/**
 * Description: Follow someone
 * Path: /follow
 * Method: POST
 * Header: {Authorization: Bearer <access-token>}
 * Body: {followed_user-id}
 */
usersRouter.post('/follow', accessTokenValidate,followValidator, wrapHandleError(followController))
// usersRouter.post('/follow', accessTokenValidate,verifyUserValidator,followValidator, wrapHandleError(followController))
/**
 * Description: Unfollow someone
 * Path: /follow/user_id
 * Method: DELETE
 * Header: {Authorization: Bearer <access-token>}
 */
usersRouter.delete('/follow/:user_id', accessTokenValidate,verifyUserValidator,unfollowValidator, wrapHandleError(unfollowController))
export default usersRouter