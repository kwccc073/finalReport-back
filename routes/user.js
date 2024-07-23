import { Router } from 'express'
import { create, login, extend, profile, logout, getCart } from '../controllers/user.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', create)
router.post('/login', auth.login, login)
router.patch('/extend', auth.jwt, extend)
router.get('/profile', auth.jwt, profile)
router.delete('/logout', auth.jwt, logout)
router.get('/cart', auth.jwt, getCart)

export default router
