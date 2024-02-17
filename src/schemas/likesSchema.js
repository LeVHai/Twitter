import { ObjectId } from "mongodb"

export class Likes{
    constructor({_id,tweet_id,user_id,create_at}){
        this._id = _id || new ObjectId()
        this.user_id = user_id
        this.tweet_id = tweet_id
        this.create_at = create_at || new Date()
    }
}