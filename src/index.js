import express from 'express'
import usersRouter from './routes/usersRoutes.js'
import databaseService from './services/databaseService.js'
import { defaultErrorHandler } from './middlewares/errorMidleware.js'
import mediasRouter from './routes/mediasRoutes.js'
import { initFodler } from './utils/files.js'
import { config } from 'dotenv'
import path from 'path'
import tweetsRouter from './routes/tweetRoutes.js'
import bookmarksRouter from './routes/bookmarkRoutes.js'
import likesRouter from './routes/likesRoutes.js'
import searchRouter from './routes/searchRoutes.js'
config()
const app = express()
const port = 4000
app.use('/static/images',express.static(path.resolve('uploads/images')))
app.use('/static/videos',express.static(path.resolve('uploads/videos')))
console.log(path.resolve('uploads/videos'));
app.use(express.json())
initFodler()
databaseService.connect().then(
  ()=>{
    databaseService.indexUser()
  }
)
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets',tweetsRouter)
app.use('/search',searchRouter)
app.use('/bookmarks',bookmarksRouter)
app.use('/likes',likesRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})