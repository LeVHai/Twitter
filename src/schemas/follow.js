 export class Follower{
    constructor({_id,user_id,followed_user_id,created_at}){
        this._id = _id,
        this.user_id = user_id,
        this.followed_user_id = followed_user_id,
        this.created_at = created_at || new Date()
    }
 }