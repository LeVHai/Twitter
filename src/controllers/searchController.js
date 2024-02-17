import searchService from "../services/searchService.js"

export const searchController =async (req,res)=>{
    const limit = Number(req.query.limit)
    const page = Number(req.query.page)
    const content = req.query.content
    const result = await searchService.search({limit,page,content})
    res.json({
        message: "Search successfully",
        result
    })
}