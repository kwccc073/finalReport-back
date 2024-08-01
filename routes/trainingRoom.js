// 引入建構api的套件
import { Router } from 'express'
// 引入middlewares
import upload from '../middlewares/upload.js'
// 引入controllers中的函式
import { create, getAll } from '../controllers/trainingRoom.js'

const router = Router()

// auth.jwt 判斷是哪位使用者，所有需要判斷使用者的功能都要用

// 建立練鼓室資料-----------------------------
router.post('/', upload, create)
// 顯示練鼓室資料用-----------------------------
router.get('/all', getAll)

export default router
