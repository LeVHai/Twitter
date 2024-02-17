import { ObjectId } from "mongodb"

export class Tweet{
    constructor({_id,audience,content,guest_views,hashtags,medias,mentions,parent_id,type,user_id,user_views,create_at,update_at}){
        const date = new Date()
        this._id = _id
        this.user_id = user_id 
        this.audience = audience
        this.content = content
        this.hashtags = hashtags
        this.medias = medias
        this.mentions = mentions
        this.parent_id = parent_id ? new ObjectId(parent_id) : null
        this.type= type
        this.guest_views = guest_views || 0
        this.user_views = user_views|| 0
        this.create_at = create_at || date
        this.update_at = update_at || date
    }
}