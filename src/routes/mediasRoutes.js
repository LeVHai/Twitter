import { Router } from "express";
import { serveVideoStreamController, uploadImageController, uploadVideoController } from "../controllers/mediasController.js";
import { wrapHandleError } from "../utils/handles.js";
const mediasRouter = Router()
mediasRouter.post('/upload-image',wrapHandleError(uploadImageController))
mediasRouter.post('/upload-video',wrapHandleError(uploadVideoController))
//static router
mediasRouter.get('/video-stream/:name', wrapHandleError(serveVideoStreamController))
export default mediasRouter