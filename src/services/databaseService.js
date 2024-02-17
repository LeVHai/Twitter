import { MongoClient } from "mongodb";
const uri =
  "mongodb+srv://haivanle2003:hai2003hai@telegram.x7cezre.mongodb.net/?retryWrites=true&w=majority";
class DatabaseService {
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db("twiiter");
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 });
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    } catch (error) {
      console.log(err);
      throw error;
    }
  }
  indexUser() {
    this.user.createIndex({ email: 1, password: 1 });
    this.user.createIndex({ email: 1 }, { unique: true });
    this.user.createIndex({ username: 1 }, { unique: true });
  }
  indexRefreshToken(){
    this.refreshToken.createIndex({token : 1})
  }
  get user() {
    return this.db.collection("users");
  }
  get tweet() {
    return this.db.collection("tweets");
  }
  get bookmarks(){
    return this.db.collection("bookmarks")
  }
  get likes(){
    return this.db.collection("likes")
  }
  get hashtags(){
    return this.db.collection("hashtags")
  }
  get refreshToken() {
    return this.db.collection("refresh_token");
  }
  get followed() {
    return this.db.collection("follower");
  }
}
const databaseService = new DatabaseService();
export default databaseService;
