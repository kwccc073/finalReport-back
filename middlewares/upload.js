// ******可參考0626課程**********
import multer from 'multer' // 處理檔案上傳
import { v2 as cloudinary } from 'cloudinary' // 雲端
import { CloudinaryStorage } from 'multer-storage-cloudinary' // 將檔案上傳至雲端
import { StatusCodes } from 'http-status-codes' // 狀態碼

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

const upload = multer({
  storage: new CloudinaryStorage({ cloudinary }),
  fileFilter (req, file, callback) {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      callback(null, true)
    } else {
      callback(new Error('FORMAT'), false)
    }
  },
  limits: {
    fileSize: 1024 * 1024
  }
})

export default (req, res, next) => {
  // 只傳一個圖片
  upload.single('icon')(req, res, error => {
    if (error instanceof multer.MulterError) {
      let message = '上傳錯誤-upload.js'
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = '檔案太大-upload.js'
      }
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else if (error) {
      if (error.message === 'FORMAT') {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: '檔案格式錯誤-upload.js'
        })
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: '未知錯誤-upload.js'
        })
      }
    } else {
      next() // 進到下一步
    }
  })
}
