import sharp from "sharp";
import fs from 'fs'
import { UPLOAD_IMAGE_DIR, getNameFromFullName, handleUploadImage, handleUploadVideo } from "../utils/files.js";

class MediasService{
    async uploadImage(req){
        const files = await handleUploadImage(req)
        console.log(files);
        const result = await Promise.all(files.map(async(file)=>{
        const newName = getNameFromFullName(file)
        const newPath = UPLOAD_IMAGE_DIR +`/${newName}.jpg`
        await sharp(file.filepath).jpeg().toFile(newPath);
        fs.unlinkSync(file.filepath)
        return {
            url:`http://localhost:3000/static/images/${newName}.jpg `
        }
        }))
        return result
    }
    async uploadVideo(req){
        const file = await handleUploadVideo(req)
        console.log(">>>>>>>>>>>>>>>");
        const newFilename = file[0].newFilename
        // const {newFilename} = file[0]
        return {
            url:`http://localhost:4000/medias/video-stream/${newFilename}`
        }
    }
}

const mediasService = new MediasService()
export default mediasService