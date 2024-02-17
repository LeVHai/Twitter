import { body, checkSchema } from "express-validator";
import { validate } from "../utils/validator.js";
import databaseService from "../services/databaseService.js";
import userService from "../services/userService.js";
import { ErrorWithStatus } from "../models/errors.js";
import { sha256 } from "../utils/crypto.js";
import { verifyToken } from "../utils/jwt.js";
import pkg from "jsonwebtoken";
const { JsonWebTokenError } = pkg;
import { config } from "dotenv";
import { ObjectId } from "mongodb";
import _ from "lodash";
import { UserVeryfyStatus } from "../schemas/userSchema.js";
import { REGEX_USERNAME } from "../constants/regex.js";
config();

const passwordSchema = {
  notEmpty: {
    errorMessage: "Password is require",
  },
  isString: "Password must be is string",
  isLength: {
    options: {
      min: 6,
      max: 50,
    },
    errorMessage: "Password length must be from 6 to 50 character",
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1,
    },
    errorMessage:
      "Password must be 6 - 50 character long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol ",
  }
}
const confirmPasswordSchema = {
  notEmpty: {
    errorMessage: "Password is require",
  },
  isString: "Password must be is string",
  isLength: {
    options: {
      min: 6,
      max: 50,
    },
    errorMessage: "Password length must be from 6 to 50 character",
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1,
    },
    errorMessage:
      "Password must be 6 - 50 character long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol ",
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirm password must be the same as password");
      }
      return true;
    },
  },
}


export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.user.findOne({
              email: value,
              password: sha256(req.body.password),
            });
            if (user === null) {
              throw new Error("Email or password is incorrect");
            }
            req.user = user;
            return true;
          },
        },
      },
      password:passwordSchema
    },
    ["body"]
  )
);
export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: "Name is require",
        },
        isString: {
          errorMessage: "Name must be is string",
        },
        isLength: {
          options: {
            min: 1,
            max: 100,
          },
          errorMessage: "Name length must be from 1 to 100 character",
        },
        trim: true,
      },
      email: {
        notEmpty: {
          errorMessage: "Email is require",
        },
        isEmail: "Email is invalid",
        trim: true,
        custom: {
          options: async (value) => {
            const email = await userService.checkEmailExit(value);
            if (email) {
              // throw new ErrorWithStatus({message:'Email already exits',status: 400})
              throw new Error("Email already exits");
            }
            return true;
          },
        },
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      day_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true,
          },
          errorMessage: "Day of birth must be is ISO8601",
        },
      },
    },
    ["body"]
  )
);
export const accessTokenValidate = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            const access_Token = value.split(" ")[1];
            if (!access_Token) {
              throw new ErrorWithStatus({
                message: "Access token is require",
                status: 401,
              });
            }
            const decoded_authorization = await verifyToken({
              token: access_Token,
              secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN,
            });
            req.decoded_authorization = decoded_authorization;
            return true;
          },
        },
      },
    },
    ["headers"]
  )
);
export const refreshTokenValidator = validate(
  checkSchema({
    refresh_token: {
      trim: true,
      custom: {
        options: async (value, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: "Refresh token is require",
              status: 401,
            });
          }
          try {
            const decoded_refreshToken = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN,
            });
            console.log(decoded_refreshToken);
            const refresh_token = await databaseService.refreshToken.findOne({
              token: value,
            });
            // Lỗi thường (1)
            if (refresh_token == null) {
              throw new ErrorWithStatus({
                message: "Used refresh token or not exist",
                status: 401,
              });
            }
            req.decoded_refreshToken = decoded_refreshToken;
          } catch (error) {
            // Kiểu lỗi của mình là JSON Web token (2)
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: "Refresh token is invalid",
                status: 401,
              });
            }
            throw error; // Khi nó không nhảy vào trường hợp 2 thì sẽ nhảy vào trường hợp 1
          }
          return true;
        },
      },
    },
  })
);
export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      custom: {
        options: async (value, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: "Email verify token is require",
              status: 401,
            });
          }
          try {
            console.log(3);
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
            });
            console.log(
              "decoded_email_verify_token",
              decoded_email_verify_token
            );
            req.decoded_email_verify_token = decoded_email_verify_token;
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: "Invalid signature",
                status: 401,
              });
            }
          }
          return true;
        },
      },
    },
  })
);
export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      isEmail: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.user.findOne({
            email: value,
          });
          if (user === null) {
            throw new Error("User not found");
          }
          req.user = user;
          return true;
        },
      },
    },
  })
);
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema({
    forgot_password_token: {
      trim: true,
      custom: {
        options: async (value, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: "Refresh token is require",
              status: 401,
            });
          }
          try {
            const decoded_forgot_password_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
            });
            const { user_id } = decoded_forgot_password_token;
            console.log("user_id", user_id);
            const user = await databaseService.user.findOne({
              _id: new ObjectId(user_id),
            });
            // Lỗi thường (1)
            if (user === null) {
              throw new ErrorWithStatus({
                message: "Used not found",
                status: 404,
              });
            }
            if (user.forgot_password_token !== value) {
              throw new ErrorWithStatus({
                message: "Invalid forgot password token",
                status: 401,
              });
            }
          } catch (error) {
            // Kiểu lỗi của mình là JSON Web token (2)
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: _.capitalize(error.message),
                status: 401,
              });
            }
            throw error; // Khi nó không nhảy vào trường hợp 2 thì sẽ nhảy vào trường hợp 1
          }
          return true;
        },
      },
    },
  })
);
export const changePasswordValidator = validate(
  checkSchema({
    old_password:{
      ...passwordSchema,
      custom : {
        options:async (value,{req})=>{
          const {user_id} = req.decoded_authorization
          const user = await databaseService.user.findOne({
            _id: new ObjectId(user_id)
          })
          if(!user){
            throw new ErrorWithStatus({
              message:'User not found',
              status: 404
            })
          }
          const {password} = user
          const isMatch = sha256(value) === password
          if(!isMatch){
            throw new ErrorWithStatus({
              message:'Old password not match',
              status: 401
            })
          }
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)
export const verifyUserValidator = (req, res, next) => {
  const { verify } = req.decoded_authorization;
  if (verify !== UserVeryfyStatus.Veryfied) {
    return next(
      new ErrorWithStatus({ message: "User not verify", status: 403 })
    );
  }
  next();
};
export const upDateMeValidator = validate(
  checkSchema({
    name: {
      optional: true,
      notEmpty: {
        errorMessage: "Name is require",
      },
      isString: {
        errorMessage: "Name must be is string",
      },
      isLength: {
        options: {
          min: 1,
          max: 100,
        },
        errorMessage: "Name length must be from 1 to 100 character",
      },
      trim: true,
    },
    day_of_birth: {
      optional: true,
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true,
        },
        errorMessage: "Day of birth must be is ISO8601",
      },
    },
    bio: {
      optional: true,
      isString: {
        errorMessage: "Bio must be is string",
      },
      trim: true,
      isLength: {
        options: {
          min: 0,
          max: 100,
        },
        errorMessage: "Biographi must be from 0 to 100",
      },
    },
    location: {
      optional: true,
      isString: {
        errorMessage: "Location must be is string",
      },
      trim: true,
      isLength: {
        options: {
          min: 0,
          max: 100,
        },
        errorMessage: "Location must be from 0 to 100",
      },
    },
    website: {
      optional: true,
      isString: {
        errorMessage: "Website must be is string",
      },
      trim: true,
      isLength: {
        options: {
          min: 0,
          max: 100,
        },
        errorMessage: "Website must be from 0 to 100",
      },
    },
    username: {
      optional: true,
      isString: {
        errorMessage: "Username must be is string",
      },
      trim: true,
      custom:{
        options:async (value) =>{
          if(!REGEX_USERNAME.test(value)){
            throw new Error('Username must 4-15 characters long and contain only letters, number and underscores, not only number')
          }
         const user = await databaseService.user.findOne({username : value})
         if(user !== null){
          throw new Error('Username existed')
         }
        }
      }
    },
    avatar: {
      optional: true,
      isString: {
        errorMessage: "Avatar must be is string",
      },
      trim: true,
      isLength: {
        options: {
          min: 0,
          max: 100,
        },
        errorMessage: "Avatar must be from 0 to 100",
      },
    },
    cover_photo: {
      optional: true,
      isString: {
        errorMessage: "Cover photo must be is string",
      },
      trim: true,
      isLength: {
        options: {
          min: 0,
          max: 50,
        },
        errorMessage: "Cover photo must be from 0 to 50",
      },
    },
  })
);
export const followValidator = validate(
  checkSchema({
    followed_user_id:{
      custom: {
        options :async(value)=>{
          if(!ObjectId.isValid(value)){
            throw new ErrorWithStatus({
              message: 'Invalid followed user id',
              status: 404
            })
          }
          const followed_user = await databaseService.user.findOne({
            _id: new ObjectId(value)
          })
          if(followed_user === null){
            throw new ErrorWithStatus({
              message: 'User not found',
              status : 404
            })
          }
        }
      }
    }
  },["body"])
)
export const unfollowValidator = validate(
  checkSchema({
    user_id:{
      custom: {
        options :async(value)=>{
          if(!ObjectId.isValid(value)){
            throw new ErrorWithStatus({
              message: 'Invalid followed user id',
              status: 404
            })
          }
          const followed_user = await databaseService.user.findOne({
            _id: new ObjectId(value)
          })
          if(followed_user === null){
            throw new ErrorWithStatus({
              message: 'User not found',
              status : 404
            })
          }
        }
      }
    }
  },["params"])
)
export const isUserLoginValidator = (middleware)=>{
  return (req,res,next)=>{
    if(req.headers.authorization){
      return middleware(req,res,next)
    }
    next()
  }
}