import likesService from "../services/likesService.js"

export const likesController =async (req,res)=>{
    const {user_id} = req.decoded_authorization
    const result = await likesService.likes(user_id,req.body.tweet_id)
    return res.json({
        message: 'Like success',
        result
    })
}
export const unlikesController =async (req,res)=>{
    const {user_id} = req.decoded_authorization
    const result = await likesService.unlikes(user_id,req.params.tweet_id)
    return res.json({
        message: 'Unlike success',
        result
    })
}