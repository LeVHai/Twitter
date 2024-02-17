import { ObjectId } from "mongodb";
import userService from "../services/userService.js";
import databaseService from "../services/databaseService.js";
import _ from "lodash";
export const loginController = async (req, res) => {
  const { user } = req;
  const { _id } = user;
  const result = await userService.login({
    user_id: _id.toString(),
    verify: user.verify,
  });
  console.log(result);
  res.json({
    message: "Login success",
    result,
  });
};
export const registerController = async (req, res, next) => {
  const result = await userService.register(req.body);
  res.json({
    message: "Register success",
    result,
  });
};
export const logoutController = async (req, res) => {
  const { refresh_token } = req.body;
  const result = await userService.logout(refresh_token);
  res.json(result);
};
export const refreshTokenController = async (req,res)=>{
  const {refresh_token} = req.body
  const {user_id, verify,exp} = req.decoded_refreshToken
  const result = await userService.refreshToken({user_id,verify,refresh_token,exp})
  return res.json(result)
}
export const emailVerifyController = async (req, res) => {
  const { user_id } = req.decoded_email_verify_token;
  const user = await databaseService.user.findOne(new ObjectId(user_id));
  const result = await userService.vefifyEmail(user_id);
  //Nếu không tìm thấy user
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  //Email đã verify trước đó rồi
  if (user.email_verify_token === "") {
    return res.json({
      message: "Email already verified before",
    });
  }
  return res.json({
    message: "Email verify success",
    result,
  });
};
export const resendVerifyController = async (req, res) => {
  const { user_id } = req.decoded_authorization;
  const user = await databaseService.user.findOne({
    _id: new ObjectId(user_id),
  });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  // if(user.verify === UserVeryfyStatus.Veryfied){
  //      return res.json({
  //         message: 'Email already verified email before'
  //      })
  // }

  const result = await userService.resendVerifyEmail(user_id);
  return res.json(result);
};
export const forgotPasswordController = async (req, res) => {
  const { _id, verify } = req.user;
  const result = await userService.forgotPassword({
    user_id: _id.toString(),
    verify,
  });
  return res.json(result);
};
export const verifyForgotPasswordTokenController = (req, res) => {
  return res.json({
    message: "Forgot password verify success",
  });
};
export const changePasswordController =async (req,res)=>{
    const {user_id} = req.decoded_authorization
    const {password} = req.body
  const result = await userService.changePassword(user_id,password)
  return res.json({result})
}
export const getMeController = async (req, res) => {
  const { user_id } = req.decoded_authorization;
  const user = await userService.getMe(user_id.toString());
  return res.json({ message: "Get me success", result: user });
};
export const updateMeController = async (req, res) => {
  const { user_id } = req.decoded_authorization;
  const body = _.pick(req.body,[
    "name",
    "day_of_birth",
    "bio",
    "location",
    "website",
    "username",
    "avatar",
    "cover_photo",
  ]);
  console.log(body);
  const result = await userService.updateMe(user_id,body);
  return res.json({
    message: "Update user success",
    result,
  });
};
export const followController = async (req,res)=>{
  const {user_id} = req.decoded_authorization
  const {followed_user_id} = req.body
  console.log(followed_user_id);
  const result = await userService.follow(user_id,followed_user_id)
  return res.json(result)
}
export const unfollowController = async (req,res)=>{
  const {user_id} = req.decoded_authorization
  const  followed_user_id = req.param("user_id")
  const result = await userService.unfollow(user_id,followed_user_id)
  return res.json(result)
}
