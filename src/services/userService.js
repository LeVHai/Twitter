import { ObjectId } from "mongodb";
import { RefreshToken } from "../schemas/refreshTokenSchema.js";
import { User, UserVeryfyStatus } from "../schemas/userSchema.js";
import { sha256 } from "../utils/crypto.js";
import { signToken } from "../utils/jwt.js";
import databaseService from "./databaseService.js";
import { config } from "dotenv";
import { Follower } from "../schemas/follow.js";
import { sendVerifyEmail } from "../utils/email.js";
config();
class UserService {
  signAccessToken({ user_id, verify }) {
    return signToken({
      payload: { user_id, token_type: "AccessToken", verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      },
    });
  }
  signRefreshToken({ user_id, verify, exp }) {
    if (exp) {
      return signToken({
        payload: { user_id, token_type: "RefreshToken", verify, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
        options: {
          algorithm: "HS256",
          expiresIn: exp,
        },
      });
    }

    return signToken({
      payload: { user_id, token_type: "RefreshToken", verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      },
    });
  }
  signEmailVerifyToken({ user_id, verify }) {
    return signToken({
      payload: { user_id, token_type: "Verify email token", verify },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
      },
    });
  }
  signForgotPasswordToken({ user_id, verify }) {
    return signToken({
      payload: { user_id, token_type: "Forgot password token", verify },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
      },
    });
  }
  signAccessTokenAndRefreshToken({ user_id, verify }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify }),
    ]);
  }
  async register(payload) {
    const user_id = new ObjectId();
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVeryfyStatus.Unverified,
    });
    await databaseService.user.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        password: sha256(payload.password),
        username: `user${user_id.toString()}`,
      })
    );
    const [access_token, refresh_token] =
      await this.signAccessTokenAndRefreshToken({
        user_id: user_id.toString(),
        verify: UserVeryfyStatus.Unverified,
      });

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    );
    // await sendVerifyEmail(
    //   payload.email,
    //   "Verify you email",
    //   `<h1>Verify you email<h1> <p>Click <á href="http//localhost:3000/users/verify-email/${email_verify_token}"> here </a>verify email you</p>`
    // );
    console.log(1);
    await sendVerifyEmail(payload.email,'okkk','aaaaa')
    console.log(sendVerifyEmail);
    return { access_token, refresh_token };
  }
  async checkEmailExit(email) {
    const user = await databaseService.user.findOne({ email });
    return Boolean(user);
  }
  async login({ user_id, verify }) {
    const [access_token, refresh_token] =
      await this.signAccessTokenAndRefreshToken({
        user_id: user_id.toString(),
        verify,
      });
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    );
    return { access_token, refresh_token };
  }
  async logout(refresh_token) {
    await databaseService.refreshToken.deleteOne({ token: refresh_token });
    return {
      message: "Logout success",
    };
  }
  async refreshToken({ user_id, verify, refresh_token, exp }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
    ]);
    await databaseService.refreshToken.deleteOne({ token: refresh_token });
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refreshToken,
      })
    );
    return { access_token: accessToken, refresh_token: refreshToken };
  }
  async vefifyEmail(user_id) {
    //Tạo giá trị cập nhật
    const a = await databaseService.user.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          email_verify_token: "",
          verify: UserVeryfyStatus.Veryfied,
        },
        // cập nhật một trường với giá trị thời gian hiện tại.
        //Mongo cập nhật giá trị
        $currentDate: {
          update_at: true,
        },
      }
    );
    console.log(a);
    const result = await this.signAccessTokenAndRefreshToken({
      user_id,
      verify: UserVeryfyStatus.Veryfied,
    });
    return result;
  }
  async resendVerifyEmail(user_id) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVeryfyStatus.Unverified,
    });
    console.log("Resend verify email: ", email_verify_token);
    await databaseService.user.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          email_verify_token,
        },
        $currentDate: {
          update_at: true,
        },
      }
    );
    return {
      message: "Resend verify email success",
    };
  }
  async forgotPassword({ user_id, verify }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify,
    });
    await databaseService.user.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          forgot_password_token,
        },
        $currentDate: {
          update_at: true,
        },
      }
    );
    return {
      message: "Check email to reset password",
    };
  }
  async changePassword(user_id, newPassword) {
    await databaseService.user.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          password: sha256(newPassword),
        },
        $currentDate: {
          update_at: true,
        },
      }
    );
    return {
      message: {
        message: "Change password success",
      },
    };
  }
  async getMe(user_id) {
    return await databaseService.user.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      }
    );
  }
  async updateMe(user_id, payload) {
    console.log(user_id);
    const user = await databaseService.user.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          ...payload,
        },
        $currentDate: {
          update_at: true,
        },
      }
      // {
      //   returnDocument: "before",
      //   projection: {
      //     password: 0,
      //     email_verify_token: 0,
      //     forgot_password_token: 0,
      //   },
      // }
    );
    const result = await databaseService.user.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      }
    );

    return result;
  }
  async follow(user_id, followed_user_id) {
    const followed = await databaseService.followed.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });
    if (followed === null) {
      await databaseService.followed.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id),
        })
      );
      return {
        message: "Follow success",
      };
    }
    return {
      message: "Followed",
    };
  }
  async unfollow(user_id, followed_user_id) {
    const followed = await databaseService.followed.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });
    if (followed === null) {
      return {
        message: "Already unfollowed",
      };
    }
    await databaseService.followed.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });
    return { message: "Unfollow success" };
  }
}
const userService = new UserService();
export default userService;
