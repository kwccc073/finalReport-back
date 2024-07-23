import passport from 'passport'
import passportLocal from 'passport-local'
// import passportJWT from 'passport-jwt'
import bcrypt from 'bcrypt'
import User from '../models/user.js'

passport.use('login', new passportLocal.Strategy({
  // 檢查有無這兩個欄位
  usernameField: 'account',
  passwordField: 'password'
}, async (account, password, done) => {
  // 有的話再執行這個function
  try {
    const user = await User.findOne({ account }) // await要記得加
    if (!user) {
      throw new Error('ACCOUNT')
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error('PASSWORD')
    }
    return done(null, user, null)
  } catch (error) {
    console.log(error)
    if (error.message === 'ACCOUNT') {
      return done(null, null, { message: '使用者帳號不存在' })
    } else if (error.message === 'PASSWORD') {
      return done(null, null, { message: '使用者密碼錯誤' })
    } else {
      return done(null, null, { message: '未知錯誤' })
    }
  }
}))
