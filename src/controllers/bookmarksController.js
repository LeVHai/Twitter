import bookmarkservice from "../services/bookmarkService.js"
export const bookmarksController =async (req,res)=>{
    const {user_id} = req.decoded_authorization
    const result = await bookmarkservice.bookmarkTweet(user_id,req.body.tweet_id)
    return res.json({
        message:"Boockmark tweet success",
        result
    })
 }  
 //Delete thì sẽ không gửi body lên mà sẽ lấy từ url
export const unbookmarksController = async (req,res)=>{
    const {user_id} = req.decoded_authorization
    const result = await bookmarkservice.unbookmarkTweet(user_id,req.params.tweet_id)
    return res.json({
        message:"Unboockmark tweet success",
        result
    })
 }  