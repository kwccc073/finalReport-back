// 引入建構api的套件
import { Router } from 'express'
import { create, login, extend, profile, logout, edit, editSaving, getSaving } from '../controllers/user.js'
// 引入middlewares
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', create)
// 登入要經過auth.login的欄位檢查---------------
router.post('/login', auth.login, login)
// 舊換新--------------------------------------
router.patch('/extend', auth.jwt, extend)
// 取自己的資料---------------------------------
router.get('/profile', auth.jwt, profile)
// 登出----------------------------------------
router.delete('/logout', auth.jwt, logout)
// 收藏歌曲------------------------------------
router.patch('/saving', auth.jwt, editSaving)
router.get('/saving', auth.jwt, getSaving)
// 編輯個人資料---------------------------------
router.patch('/:id', auth.jwt, upload, edit)

export default router
