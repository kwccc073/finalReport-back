// 引入套件
import { Schema, model, ObjectId, Error } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

// 我的收藏
// const saveSchema = Schema({
//   s_id: {
//     type: ObjectId,
//     ref: 'songs',
//     required: [true, '收藏必填']
//   }
// })

// 我的鼓譜------------------------------------
// 發布

// 使用者---------------------------------------
const schema = new Schema({
  // 使用者帳號
  account: {
    type: String,
    required: [true, '使用者帳號必填'],
    minlength: [4, '使用者帳號長度不符'],
    maxlength: [20, '使用者帳號長度不符'],
    unique: true, // 不可重複
    validate: {
      validator (value) {
        return validator.isAlphanumeric(value)
      },
      message: '使用者帳號格式錯誤'
    }
  },
  // 使用者密碼
  password: {
    type: String,
    required: [true, '使用者密碼必填']
  },
  // 使用者信箱
  email: {
    type: String,
    required: [true, '使用者信箱必填'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isEmail(value)
      },
      message: '使用者信箱格式錯誤'
    }
  },
  // 大頭貼
  icon: {
    type: String
  },
  tokens: {
    type: [String] // 文字陣列
  }
  // 購物車不需要，待改成收藏等等項目*************
  // cart: {
  //   type: [cartSchema]
  // },
}, {
  // 紀錄使用者建立的時間
  timestamps: true,
  // 關閉資料改了幾次的紀錄
  versionKey: false
})

// 在被保存至資料庫之前要執行的動作-----------------------
// 密碼加密
schema.pre('save', function (next) {
  const user = this
  // 如果有修改密碼
  if (user.isModified('password')) {
    // 檢查長度是否超出限制範圍
    if (user.password.length < 4 || user.password.length > 20) {
      const error = new Error.ValidationError()
      error.addError('password', new Error.ValidatorError({ message: '使用者密碼長度不符' }))
      next(error) // 如果有錯誤，將錯誤傳遞給 next()
      return
    } else {
      // 加密
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  next()
})

export default model('users', schema)
