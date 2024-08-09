import User from '../models/user.js'
import Song from '../models/song.js'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import validator from 'validator'

// 建立帳號-------------------------------------------------------
export const create = async (req, res) => {
  try {
    await User.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '註冊成功-controller'
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      // 先取出錯誤的第一個東西
      const key = Object.keys(error.errors)[0]
      // 再取錯誤訊息
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '帳號已註冊'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// 登入-----------------------------------------------------------
export const login = async (req, res) => {
  try {
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens.push(token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '登入成功-controller',
      result: {
        token,
        account: req.user.account // 帳號
        // role: req.user.role, // 現在是否為管理員
        // save: req.user.saveQuantity // 收藏欄位
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// token的舊換新-----------------------------------------------------------------------------------------
export const extend = async (req, res) => {
  try {
    // 先找索引，找到的token是否等於現在的token
    const idx = req.user.tokens.findIndex(token => token === req.token)
    // expiresIn: '7 days' => JWT七天之後過期
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    // 換成新的token
    req.user.tokens[idx] = token
    await req.user.save()
    // 換掉之後回應成功
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: token
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 取自己的資料------------------------------------------------------------------------------
// 當使用者登入之後，只會把token存在local storage裡面，重新整理的話就會需要拿token再去取得一次使用者資料
export const profile = (req, res) => {
  try {
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        // 回傳前端會需要的東西
        // 這裡不需要token，因為token已經在前端了
        account: req.user.account,
        email: req.user.email,
        icon: req.user.icon,
        id: req.user._id
        // role: req.user.role,
        // save: req.user.saveQuantity
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 登出-----------------------------------------------------------------------------------------
// 把現在的token從使用者的token陣列裡移除
export const logout = async (req, res) => {
  try {
    // 不符合現在的token就留下來
    req.user.tokens = req.user.tokens.filter(token => token !== req.token)
    await req.user.save() // 保存
    res.status(StatusCodes.OK).json({
      success: true,
      message: '登出成功-controller'
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 編輯使用者資料---------------------------------------------------------------------
export const edit = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    // req.body是前端送過來的
    req.body.icon = req.file?.path // ? 是因為有可能不換圖片

    // .findByIdAndUpdate() 是 Mongoose 提供的一個方法，用於查找 MongoDB 集合中的文檔並根據其 _id 進行更新。
    // 找到req.params.id，換成req.body，必須先執行驗證，.orFail()是如果失敗的話要執行的東西
    await User.findByIdAndUpdate(req.params.id, req.body, { runValidators: true }).orFail(new Error('NOT FOUND'))

    // 回應狀態碼
    res.status(StatusCodes.OK).json({
      success: true,
      message: '編輯個人資料成功-controller'
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '個人資料 ID 格式錯誤-controller'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無個人資料-controller'
      })
    } else if (error.name === 'ValidationError') { // 驗證錯誤
      // 先取出錯誤的第一個東西
      const key = Object.keys(error.errors)[0]
      // 再取錯誤訊息
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤-controller'
      })
    }
  }
}

// 收藏歌曲---------------------------------------------------------------------------
export const editSave = async (req, res) => {
  try {
    // 先檢查傳入的歌曲 id 是否正確
    console.log(req.body)
    if (!validator.isMongoId(req.body.song)) throw new Error('ID')

    // 尋找收藏欄位內是否有傳入的這個歌曲id：若有 => 取消收藏、沒有 => 加入收藏
    const idx = req.user.saving.findIndex(req.body.song)
    // idx > -1 => 收藏欄位內有這個歌曲
    if (idx > -1) {
      // 修改後的數量 <= 0，刪除此歌曲
      // splice(idx, 1)表示從索引刪除一個
      req.user.saving.splice(idx, 1)
    } else {
      // 如果收藏欄位內沒這個歌曲：檢查這個歌曲是否存在
      const song = await Song.findById(req.body.song).orFail(new Error('NOT FOUND')) // 沒有找到的話就丟出錯誤'NOT FOUND'
      if (!song.isPublic) throw new Error('PUBLIC') // 如果下架了就丟出錯誤'PUBLIC'

      req.user.saving.push(
        song._id
      )
    }

    await req.user.save() // 保存
    res.status(StatusCodes.OK).json({
      success: true,
      message: '編輯收藏欄位成功-controller'
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '歌曲 ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無歌曲'
      })
    } else if (error.message === 'PUBLIC') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '歌曲已鎖住'
      })
    } else if (error.name === 'ValidationError') {
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
