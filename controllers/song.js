// 引入 model
import Song from '../models/song.js'
// 引入狀態碼
import { StatusCodes } from 'http-status-codes'
import validator from 'validator'

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
      // 是上面的變數= Song.create(req.body)
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

// 取得全部歌曲資料-------------------------------------------------------------
export const getAll = async (req, res) => {
  try {
    // sortBy、sortOrder、itemsPerPage、page、search是前端送過來的
    // || 表示如果有前面的值則帶入前面的值
    // 若前面的值為null、undefined、0、NaN、空字符串 '' 或 false，則帶入後面的值
    const sortBy = req.query.sortBy || 'createdAt'
    const sortOrder = req.query.sortOrder || 'desc'
    // req.query收到的都是文字，所以要*1轉成數字
    const itemsPerPage = req.query.itemsPerPage * 1 || 10
    const page = req.query.page * 1 || 1
    // 原本搜尋需要完全符合才可以搜尋到，因此需透過正則表達式來處理
    // 如果 req.query.search 沒有被定義或其值為「假值」（例如 null、undefined等）則會為''，''使search是空的情況下會全部都匹配
    // 'i'是正則表達式的模式，表示不分大小寫
    const regex = new RegExp(req.query.search || '', 'i')

    // 尋找歌曲--------------------------------------------
    const data = await Song
      // 查詢---------------------------------
      // .find()為JS內建的陣列方法，()裡面放查詢條件
      .find({
        // 先寫演唱/演奏者、歌名就好*****待編輯******
        $or: [
          // 演唱/演奏者符合regex
          { singer: regex },
          // 歌名符合regex
          { songTitle: regex },
          { songStyle: regex }
        ]
      })
      // 排序----------------------------------
      // 這裡的[]不是指陣列
      // {[要排序的欄位]: 排序的順序（如asc、desc`、1、-1）}
      .sort({ [sortBy]: sortOrder })

      // 分頁----------------------------------
      // 如果一頁有 10 筆
      // 第一頁 = 1 ~ 10 = 跳過 0 筆 = (第 1 頁 - 1) * 10 = 0
      // 第二頁 = 11 ~ 20 = 跳過 10 筆 = (第 2 頁 - 1) * 10 = 10
      // 第三頁 = 21 ~ 30 = 跳過 20 筆 = (第 3 頁 - 1) * 10 = 20
      // .skip()和.limit() 是 MongoDB 的查詢方法
      .skip((page - 1) * itemsPerPage) // 跳過幾筆
      .limit(itemsPerPage) // 回傳幾筆

    // 總共幾筆資料----------------------------
    // .estimatedDocumentCount()是monogoose內建的
    const total = await Song.estimatedDocumentCount()

    // 回傳狀態碼------------------------------
    res.status(StatusCodes.OK).json({
      success: true,
      message: '尋找全部歌曲-controller',
      result: {
        data, total
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤-controller'
    })
  }
}

// 查單個歌曲 （歌曲介面用）--------------------------------------------------------------------
export const getId = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    const result = await Song.findById(req.params.id).orFail(new Error('NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '成功查單個歌曲-controller',
      result
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '歌曲 ID 格式錯誤-controller'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無歌曲-controller'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤-controller'
      })
    }
  }
}
