// 引入建構api的套件
import { Router } from 'express'
// 引入controllers中的函式
import { create } from '../controllers/song.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

// auth.jwt 判斷是哪位使用者，所有需要判斷使用者的功能都要用

// 建立歌曲
router.post('/', auth.jwt, create)

export default router
