// 引入建構api的套件
import { Router } from 'express'
// 引入middlewares
import upload from '../middlewares/upload.js'
// 引入controllers中的函式
import { create, edit, getAll, deleteTrainingRoom } from '../controllers/trainingRoom.js'

const router = Router()

// auth.jwt 判斷是哪位使用者
// 練鼓室部分沒有登入也可以新增、編輯、查詢，因此不需要引入auth.js

// 建立練鼓室資料-----------------------------
router.post('/', upload, create)
// 顯示練鼓室資料用-----------------------------
router.get('/all', getAll)
// 編輯練鼓室----------------------------------------
// /:id => 指定id的練鼓室
router.patch('/:id', upload, edit)
// 刪除練鼓室--------------------------------------
router.delete('/:id', deleteTrainingRoom)

export default router
