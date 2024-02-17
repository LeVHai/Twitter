import { ObjectId } from "mongodb";
import databaseService from "./databaseService.js";
import { Likes } from "../schemas/likesSchema.js";

class LikesService {
  async likes(user_id, tweet_id) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id),
      },
      {
        $setOnInsert: new Likes({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id),
        }),
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );
    if (result === null) {
      return;
    }
    return result;
  }
  async unlikes(user_id, tweet_id) {
    const result = await databaseService.likes.findOneAndDelete(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id),
      }
    );
    if (result === null) {
      return;
    }
    return result;
  }
}
const likesService = new LikesService();
export default likesService;
