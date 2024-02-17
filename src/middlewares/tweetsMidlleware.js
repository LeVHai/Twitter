import { checkSchema } from "express-validator";
import { validate } from "../utils/validator.js";
import { TweetAudience, TweetType } from "../constants/TweetType.js";
import { numberObjectToArray } from "../utils/common.js";
import { ObjectId } from "mongodb";
import _ from "lodash";
import databaseService from "../services/databaseService.js";
import { ErrorWithStatus } from "../models/errors.js";
import { UserVeryfyStatus } from "../schemas/userSchema.js";
import { wrapHandleError } from "../utils/handles.js";

const tweetType = numberObjectToArray(TweetType);
const tweetAudience = numberObjectToArray(TweetAudience);
console.log(tweetAudience);
console.log(tweetType);
export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetType],
        errorMessage: "Invalid type",
      },
    },
    audience: {
      isIn: {
        options: [tweetAudience],
        errorMessage: "Invalid audience",
      },
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type;
          //Nếu type là retweet , comment,quoteTweet thì parent_id phải là tweet_id của tweet cha
          if (
            [
              TweetType.Retweet,
              TweetType.Comment,
              TweetType.QuoteTweet,
            ].includes(type) &&
            !ObjectId.isValid(value)
          ) {
            throw new Error("Parent id must be a valid Tweet id");
          }
          //Nếu type là tweet thì parent_id phải là null
          if (TweetType.Tweet === type && value !== null) {
            throw new Error("Parent_id must be null");
          }
          return true;
        },
      },
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type;
          const hashtags = req.body.hashtags;
          const mentions = req.body.mentions;
          //Nếu type là comment,quoteTweet, tweet và không có mentions và hashtag thì content phải là string không được rỗng
          if (
            [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(
              type
            ) &&
            _.isEmpty(hashtags) &&
            _.isEmpty() &&
            value === ""
          ) {
            throw new Error("Content must be a non empty string");
          }
          //Nếu type là tweet thì content phải là `''`
          if (type === TweetType.Retweet && value !== "") {
            throw new Error("Content must be empty string");
          }
          return true;
        },
      },
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //Yêu cầu mỗi phần tử trong array là string
          if (value.some((item) => typeof item !== "string")) {
            throw new Error("Hashtag must be an array of string");
          }
          return true;
        },
      },
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //Yêu cầu mỗi phần tử trong array là string
          if (value.some((item) => !ObjectId.isValid(item))) {
            throw new Error("Mentions must be an array of user id");
          }
          return true;
        },
      },
    },
    // medias:{
    //     isArray: true,
    //     custom : {
    //         options: (value,{req})=>{
    //             //Yêu cầu mỗi phần tử trong array là string
    //             if(value.some(item => !ObjectId.isValid(item))){
    //                 throw new Error ('Mentions must be an array of user id')
    //             }
    //         }
    //     }
    // }
  })
);
export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isMongoId: true,
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: "Invalid tweet id",
                status: 400,
              });
            }
            const [tweet] = await databaseService.tweet
              .aggregate([
                {
                  $match: {
                    _id: new ObjectId(value),
                  },
                },
                {
                  $lookup: {
                    from: "hashtags",
                    localField: "hashtags",
                    foreignField: "_id",
                    as: "hashtags",
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "mentions",
                    foreignField: "_id",
                    as: "mentions",
                  },
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: "$mentions",
                        as: "mention",
                        in: {
                          _id: "$$mention._id",
                          name: "$$mention.name",
                          user_name: "$$mention.user_name",
                          email: "$$mention.email",
                        },
                      },
                    },
                  },
                },
                {
                  $lookup: {
                    from: "bookmarks",
                    localField: "_id",
                    foreignField: "tweet_id",
                    as: "bookmarks",
                  },
                },
                {
                  $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "tweet_id",
                    as: "likes",
                  },
                },
                {
                  $lookup: {
                    from: "tweets",
                    localField: "_id",
                    foreignField: "parent_id",
                    as: "tweet_children",
                  },
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: "$bookmarks",
                    },
                    likes: {
                      $size: "$likes",
                    },
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: "$tweet_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", 1],
                          },
                        },
                      },
                    },
                    comment: {
                      $size: {
                        $filter: {
                          input: "$tweet_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", 2],
                          },
                        },
                      },
                    },
                    quote: {
                      $size: {
                        $filter: {
                          input: "$tweet_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", 3],
                          },
                        },
                      },
                    },
                    views: {
                      $add: ["$user_views", "$guest_views"],
                    },
                  },
                },
                {
                  $project: {
                    tweet_children: 0,
                  },
                },
              ])
              .toArray();
            if (!tweet) {
              throw new ErrorWithStatus({
                message: "Tweet not found",
                status: 404,
              });
            }
            req.tweet = tweet;
            return tweet;
          },
        },
      },
    },
    ["body", "params"]
  )
);

//Muốn sử dụng async trong Handle express thì phải có try catch
//Nếu không dùng try catch thì dùng wrapHandlError
export const audienceValidator = wrapHandleError(async (req, res, next) => {
  const tweet = req.tweet;
  if (tweet.audience === TweetAudience.TwitterCircle) {
    //Kiểm tra người xem đã đăng nhập
    if (!req.headers.authorization) {
      throw new ErrorWithStatus({
        message: "Access token is require",
        status: 401,
      });
    }
    //Kiểm ta tk người dùng có bị khoá
    const { user_id } = req.decoded_authorization;
    const author = await databaseService.user.findOne({
      _id: new ObjectId(user_id),
    });
    if (!author || author.verify === UserVeryfyStatus.Banned) {
      throw new ErrorWithStatus({
        message: "User not found",
        status: 404,
      });
    }
    //Kiểm tra người dùng có nằm trong  tweet circle hay không
    //method some thì cchir cần có một thằng thoản mã đk trong callback thì sẽ dừng lại
    //Methor equals là method có sẵn của ObjectId kiểm tra xem 1 ObjectId và 1 string dạng ObjectId hay không
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => {
      user_circle_id.equals(user_id);
    }); //Không nằm trong twitter circle
    console.log(isInTwitterCircle);
    if (!isInTwitterCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        message: "Tweet is not public",
        status: 403,
      });
    }
  }
  next();
});
export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetType],
          errorMessage: "Invalid Tweet",
        },
      },
      limit: {
        isNumeric: true,
        custom: {
          options: (value) => {
            const num = Number(value);
            if (num > 100) {
              throw new Error("Maximum is 100");
            }
            return true;
          },
        },
      },
      page: {
        isNumeric: true,
      },
    },
    ["query"]
  )
);
