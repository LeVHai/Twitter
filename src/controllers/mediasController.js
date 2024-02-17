import path from "path";
import fs from 'fs';
import { fileURLToPath } from "url";
import mediasService from "../services/mediasService.js";
import { UPLOAD_VIDEO_DIR } from "../utils/files.js";
import mime from "mime";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const uploadImageController = async (req, res) => {
  const result = await mediasService.uploadImage(req)
  console.log(result);
  return res.json({
    messaga: 'Upload successfully',
    result
  })
};
export const uploadVideoController = async (req, res) => {
  const result = await mediasService.uploadVideo(req)
  return res.json({
    messaga: 'Upload successfully',
    result
  })
};
export const serveVideoStreamController = (req,res)=>{
  const range = req.headers.range;
  if (!range) {
    res.status(400).send('Requires Range header');
    return;
  }
  const {name}= req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR,name)
  const videoSize = fs.statSync(videoPath).size
  const chunkSize = 10 ** 6; // 1MB
  //Lấy giá trị byte bắt đầu từ header Range VD:bytes =1048576-
  const start = Number(range.replace(/\D/g, ''))
  //Lấy giá trị byte kết thúc, vượt quá dung lượng video thì lấy giá trị videoSize
   const end = Math.min(start + chunkSize, videoSize -1 );
   //Dung lượng thực tế cho mỗi đoạn video stream
   //Thường sẽ lấy là chunkSize, ngoại trừ đoạn cuối cùng 
   const contentLength = end - start + 1
   const contentType  = mime.getType(videoPath) || 'video/*'
   /*
   *Format của header Content-Range : byte: <start>-<end>/contentLength 
   *Yêu cầu end phải luôn nhỏ hơn contentLength
   *Content-Length sẽ là end - start + 1 .Đại diện cho khoảng cách 
   */
   const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType,
  };
  res.writeHead(206, headers);

   const videoStream = fs.createReadStream(videoPath, { start, end });

   videoStream.pipe(res);

}