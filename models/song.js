// 引入套件
import { Schema, model, ObjectId } from 'mongoose'

// 留言
const messageSchema = Schema({
  // 外來鍵 Foreign Key (FK)，用來存放來別張資料表的資料主鍵
  user: {
    type: ObjectId,
    ref: 'users'
    // 必填***待編輯***
    // required: [true, '使用者必填']
  },
  message: {
    type: String
    // 必填***待編輯***
    // required: [true, '留言內容必填']
  }
})

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
  signatureBeat: {
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
  },
  scoreHiHat: {
    type: [[[Boolean]]]
    // 預設值待編輯
  },
  scoreSnare: {
    type: [[[Boolean]]]
    // 預設值待編輯
  },
  scoreKick: {
    type: [[[Boolean]]]
    // 預設值待編輯
  },
  message: {
    type: [messageSchema]
  }
}, {
  timestamps: true,
  versionKey: false
})

export default model('songs', schema)
