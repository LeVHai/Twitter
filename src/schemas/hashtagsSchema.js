import { ObjectId } from "mongodb"

export default class Hashtag{
    constructor({_id,name,create_at}){
        this._id = _id || new ObjectId(),
        this.name =name
        this.create_at = create_at || new Date
    }
}