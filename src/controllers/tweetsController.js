import tweetService from "../services/tweetsService.js";

export const createTweetController = async (req, res) => {
  const { user_id } = req.decoded_authorization;
  const result = await tweetService.createTweet(req.body, user_id);
  res.json({
    message: "Create tweet success",
    result,
  });
};

export const getTweetController = async (req, res) => {
  const result = await tweetService.increaseView(
    req.params.tweet_id,
    req.decoded_authorization.user_id
  );
  return res.json({
    message: "Get tweet successfully",
    result: result,
  });
};
export const getTweetChildrenController = async (req, res) => {
  const tweet_id = req.params.tweet_id;
  const tweet_type = Number(req.query.tweet_type);
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);
  const {user_id} = req.decoded_authorization
  const { total, tweet } = await tweetService.getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  });
  return res.json({
    message: "Get tweet successfully",
    result: {
      tweet,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(page/limit),
    },
  });
};
