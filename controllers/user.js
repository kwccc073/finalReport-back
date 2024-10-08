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
      message: '註冊成功'
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
      message: '登入成功',
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
        id: req.user._id,
        saving: req.user.saving
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
      message: '登出成功'
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
      message: '編輯個人資料成功'
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '個人資料 ID 格式錯誤-edit '
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無個人資料'
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
        message: '未知錯誤'
      })
    }
  }
}

// 收藏歌曲---------------------------------------------------------------------------
export const editSaving = async (req, res) => {
  try {
    // 先檢查傳入的歌曲 id 對不對
    if (!validator.isMongoId(req.body.song)) throw new Error('ID')
    // 檢查歌曲是否存在
    const song = await Song.findById(req.body.song).orFail(new Error('NOT FOUND')) // 沒有找到的話就丟出錯誤'NOT FOUND'
    // 尋找收藏匣內是否有傳入的這個歌曲id：若有 => 取消收藏、沒有 => 加入收藏
    // 這個req會包含使用者的資訊
    // item.p_id會是MongoDB的格式，需要toString()才能和req.body.song比較
    const idx = req.user.saving.findIndex(item => item.toString() === req.body.song)
    // idx > -1表示收藏匣內有這個歌曲
    let isSaving = true
    if (idx > -1) {
      // 刪除此歌曲
      req.user.saving.splice(idx, 1)
      isSaving = false
      // 更新歌曲的收藏次數
      await Song.findByIdAndUpdate(
        req.body.song,
        { $inc: { savedTimes: -1 } }, // 收藏次數 -1
        { new: true }
      )
    } else {
      // 如果收藏匣內沒這個歌曲進行以下操作
      if (!song.isPublic) throw new Error('PUBLIC') // 如果歌曲未公開就丟出錯誤'PUBLIC'
      // 更新歌曲的收藏次數
      await Song.findByIdAndUpdate(
        req.body.song,
        { $inc: { savedTimes: 1 } }, // 收藏次數 -1
        { new: true }
      )
      req.user.saving.push(
        song._id
      )

      isSaving = true
    }

    await req.user.save() // 保存使用者資料
    res.status(StatusCodes.OK).json({
      success: true,
      message: '編輯收藏匣成功',
      result: req.user.saving,
      isSaving: isSaving
    })
  } catch (error) {
    console.error('Error details:', error) // 輸出詳細錯誤信息
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
        message: '歌曲已下架'
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
        message: '未知錯誤-editSaving'
      })
    }
  }
}

// 取得收藏的歌曲---------------------------------------------------------------
export const getSaving = async (req, res) => {
  try {
    // 要先取得使用者，然後只要找他的收藏匣欄位('saving')
    // .populate('要關聯的欄位')用關聯的方式把歌曲資訊帶入
    const result = await User.findById(req.user._id, 'saving').populate('saving')

    if (!result || !result.saving) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '未找到收藏的歌曲'
      })
    }

    // console.log(result.saving) // 收藏的歌曲之完整資訊

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

    // 過濾後的歌曲
    const filteredSongs = result.saving
      // 尋找歌曲
      .filter(song => {
        return (
          (regex.test(song.singer) ||
           regex.test(song.songTitle) ||
            regex.test(song.songStyle))
        )
      })
      // 排序
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return a[sortBy] > b[sortBy] ? 1 : -1
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1
        }
      })

    // 分頁處理
    const paginatedSongs = filteredSongs.slice((page - 1) * itemsPerPage, (page - 1) * itemsPerPage + itemsPerPage)

    // 總筆數
    const total = filteredSongs.length

    res.status(StatusCodes.OK).json({
      success: true,
      message: '取得收藏匣成功',
      result: [
        paginatedSongs,
        total
      ]
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤-getSaving'
    })
  }
}
