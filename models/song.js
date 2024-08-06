// 引入套件
import { Schema, model } from 'mongoose'

const schema = new Schema({
  // 建立此歌曲的使用者
  editor: {
    type: String,
    required: [true, '建立者必填-model']
  },
  // 歌手/樂團
  singer: {
    type: String,
    required: [true, '演唱者必填-model']
  },
  // 歌名
  songTitle: {
    type: String,
    required: [true, '歌名必填-model']
  },
  // 曲風
  songStyle: {
    type: String,
    required: [true, '曲風必填-model'],
    enum: {
      values: ['流行', '龐克', '金屬', '後搖', '慢搖', '民謠', '爵士', '其他'],
      // 錯誤訊息：{VALUE} 會自動替換成傳入的值
      message: '錯誤，查無曲風'
    }
  },
  // 速度
  BPM: {
    type: Number,
    required: [true, 'BPM必填-model'],
    default: 0 // 預設為 0
  },
  // 難易度
  degreen: {
    type: [Number], // 數字陣列
    default: []
    // minlength: [1, '最少1分'],
    // maxlength: [5, '最多5分']
    // 待編輯
  },
  // 拍號：一個小節有幾拍
  signatureSection: {
    type: Number,
    // required: [true, '必填'],
    default: 4,
    enum: {
      values: [2, 3, 4, 6, 9]
    }
  },
  // 拍號：以幾分音符為一拍
  signatureNote: {
    type: Number,
    // required: [true, '必填'],
    default: 4,
    enum: {
      values: [2, 4, 8]
    }
  }
}, {
  timestamps: true,
  versionKey: false
})

export default model('songs', schema)
