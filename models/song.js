// 引入套件
import { Schema, model } from 'mongoose'

const schema = new Schema({
  // 歌手/樂團
  singer: {
    type: String,
    required: [true, '必填']
  },
  // 歌名
  songTitle: {
    type: String,
    required: [true, '必填']
  },
  // 曲風
  songStyle: {
    type: String,
    required: [true, '必填'],
    enum: {
      // 限制欄位只能有陣列內的值
      values: ['流行', '龐克', '金屬', '後搖', '慢搖', '民謠', '爵士', '其他'],
      // 錯誤訊息：{VALUE} 會自動替換成傳入的值
      message: '曲風分類錯誤，查無 "{VALUE}" 分類'
    }
  },
  // 速度
  BPM: {
    type: Number,
    default: [0] // 預設為包含一個元素 0 的數字陣列
    // 待編輯
  },
  // 難易度
  degreen: {
    type: [Number], // 數字陣列
    default: 1,
    minlength: [1, '最少1分'],
    maxlength: [5, '最多5分']
    // 待編輯
  },
  // 拍號：一個小節有幾拍
  signatureSection: {
    type: Number,
    required: [true, '必填'],
    default: 4,
    enum: {
      values: [2, 3, 4, 6, 9]
    }
  },
  // 拍號：以幾分音符為一拍
  signatureNote: {
    type: Number,
    required: [true, '必填'],
    default: 4,
    enum: {
      values: [2, 4, 8]
    }
  }
})

export default model('songs', schema)
