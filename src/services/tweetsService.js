import { ObjectId } from "mongodb";
import { Tweet } from "../schemas/tweetSchema.js";
import databaseService from "./databaseService.js";
import Hashtag from "../schemas/hashtagsSchema.js";

class TweetService {
  async checkAndCreateHashtag(hashtags) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        //Tìm hashtag trong db nếu có thì lấy không có thì tạo mới
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag }),
          },
          { upsert: true, returnDocument: "after" }
        );
      })
    );
    return hashtagDocuments.map((hashtag) => hashtag._id);
  }
  async createTweet(body, user_id) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags);
    const result = await databaseService.tweet.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashtags,
        mentions: body.mentions.map((item) => ObjectId(item)),
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id),
      })
    );
    const tweet = await databaseService.tweet.findOne({
      _id: result.insertedId,
    });
    return tweet;
  }
  async increaseView(tweet_id, user_id) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 };
    const result = await databaseService.tweet.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        //currentDate tinh vao luc mongodb chay
        $currentDate: {
          update_at: true,
        },
      },
      {
        returnDocument: "after",
        projection: {
          guest_views: 1,
          user_views: 1,
          update_at: 1,
        },
      }
    );
    return result;
  }
  async getTweetChildren({ tweet_id, tweet_type, limit, page, user_id }) {
    const tweet = await databaseService.tweet
      .aggregate([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type,
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
        {
          $skip: limit * (page - 1), //Cong thuc phan trang
        },
        {
          $limit: limit,
        },
      ])
      .toArray();
    const date = new Date();
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 };
    const ids = tweet.map((tweet) => tweet._id);
    const [, total] = await Promise.all([
      databaseService.tweet.updateMany(
        {
          _id: {
            $in: ids, // operator tìm những tweet nào có id nằm trong arr
          },
        },
        {
          $inc: inc, // tăng lên n
          $set: {
            update_at: date, //tinh vao luc code sever chay
          },
        }
      ),
      databaseService.tweet.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type,
      }),
    ]);
    //vi updateMany khong return ve ducumen da duoc cap nhat roi nen phai cap nhat lai
    tweet.forEach((tweet) => {
      tweet.update_at = date;
      if (user_id) {
        tweet.user_views += 1;
      } else {
        tweet.guest_views += 1;
      }
    });
    return {
      tweet,
      total,
    };
  }
}

const tweetService = new TweetService();
export default tweetService;
