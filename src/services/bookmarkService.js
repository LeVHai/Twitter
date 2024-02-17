import { ObjectId } from "mongodb"
import databaseService from "./databaseService.js"
import { Bookmark } from "../schemas/boockMarkSchema.js"

 class Bookmarkservice{
    async bookmarkTweet(user_id,tweet_id){
        const result = await databaseService.bookmarks.findOneAndUpdate({
            user_id: new ObjectId(user_id),
            tweet_id: new ObjectId(tweet_id)
        },{
            $setOnInsert:new Bookmark({
                user_id: new ObjectId(user_id),
                tweet_id: new ObjectId(tweet_id)
            })
        },
        {
            upsert: true,
            returnDocument: "after"
        })
        return result
    }   
    async unbookmarkTweet(user_id,tweet_id){
        
        const result = await databaseService.bookmarks.findOneAndDelete({
            user_id: new ObjectId(user_id),
            tweet_id: new ObjectId(tweet_id)
        })
        if(result === null){
            return
        }
        return result
    }   
 }
 
const bookmarkservice = new Bookmarkservice()
export default bookmarkservice