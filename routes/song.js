// 引入建構api的套件
import { Router } from 'express'
// 引入middlewares
import upload from '../middlewares/upload.js'
import * as auth from '../middlewares/auth.js'
// 引入controllers中的函式
import { create, getAll, getMy, getId, edit,getNew } from '../controllers/song.js'

const router = Router()

// auth.jwt 判斷是哪位使用者，所有需要判斷使用者的功能都要用

// 建立歌曲 for 登入者-----------------------------
router.post('/', auth.jwt, upload, create)
// 取得所有公開的歌曲for 所有人-----------------------------
// 尋找鼓譜頁面用
router.get('/all', getAll)
router.get('/new', getNew)
// 取得自己的歌曲 for 建立者-------------------------
router.get('/my', auth.jwt, getMy)
// /:id => 取得指定id的商品 （單首歌曲介面用）for 所有人
router.get('/:id', getId)
// 編輯歌曲 for 建立者------------------------------
router.patch('/:id', auth.jwt, upload, edit)
// 刪除歌曲 for 建立者-------------------------------

export default router
