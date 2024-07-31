import User from '../models/user.js'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import validator from 'validator'

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
        // cart: req.user.cartQuantity // 購物車
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 舊換新-----------------------------------------------------------------------------------------
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
        role: req.user.role,
        cart: req.user.cartQuantity
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
