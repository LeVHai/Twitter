import databaseService from "./databaseService.js";

class Search {
  async search({ limit, page, content }) {
    const result = await databaseService.tweet
      .find({ $text: { $search: content } })
      .skip(limit * (page - 1))
      .limit(limit).toArray();
    return result;
  }
}
const searchService = new Search();
export default searchService;
