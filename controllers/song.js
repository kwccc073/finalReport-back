// 引入 model
import Song from '../models/song.js'
// 引入狀態碼
import { StatusCodes } from 'http-status-codes'

// 建立歌曲
export const create = async (req, res) => {
  try {
    // .create()是monogoose內建的，用來創建並保存一個新資料到資料庫
    const result = await Song.create(req.body)
    // 向客戶端發送一個 HTTP 回應，回應內容為 JSON 格式，如下
    res.status(StatusCodes.OK).json({
      // 操作是否成功
      success: true,
      // 額外的說明
      message: '建立歌曲成功-controller',
      // 是上面的變數= Product.create(req.body)
      result
    })
  } catch (error) {
    // 錯誤處理
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}
