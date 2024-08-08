// 引入建構api的套件
import { Router } from 'express'
// 引入middlewares
import upload from '../middlewares/upload.js'
import * as auth from '../middlewares/auth.js'
// 引入controllers中的函式
import { create, getAll, getMy, getId } from '../controllers/song.js'

const router = Router()

// auth.jwt 判斷是哪位使用者，所有需要判斷使用者的功能都要用

// 建立歌曲-----------------------------
router.post('/', auth.jwt, upload, create)
// 顯示歌曲用-----------------------------
router.get('/all', getAll)
// 得到自己的歌曲
router.get('/my', auth.jwt, getMy)
// /:id => 指定id的商品 （歌曲介面用）
router.get('/:id', getId)
export default router
