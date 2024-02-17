export class RefreshToken{
    constructor({_id,token,create_at,user_id,iat,exp}){
        this._id = _id,
        this.token = token,
        this.create_at = create_at || new Date(),
        this.user_id = user_id 
        this.iat = new Date(iat * 1000) //Convert Epoch time to date
        this. exp = new Date(exp * 1000)
    }
}