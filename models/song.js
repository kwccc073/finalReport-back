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
  // score部分-----------------------------------------------------
  // 前端會以JSON 字串形式傳進來，儲存前才會轉回原始格式，因此不能寫type: [[[Boolean]]]會傳送失敗
  // 預設值待編輯*********
  scoreHiHat: {
    // required前一定要有type，但type: String最後會保存JSON文檔而不是轉換後的原始數據
    // type: String,
    // required: [true, 'scoreHiHat必填']
  },
  scoreSnare: {
    // type: String,
    // required: [true, 'scoreSnare必填']
  },
  scoreKick: {
    // type: String,
    // required: [true, 'scoreKick必填']
  },
  // 隱私狀態－true公開、false私人
  isPublic: {
    type: Boolean,
    required: [true, '隱私狀態必填'],
    default: true
  },
  message: {
    type: [messageSchema]
  }
}, {
  timestamps: true,
  versionKey: false
})

// 在被保存至資料庫之前要執行的動作-----------------------
// 把JSON字串轉回原本的形式
schema.pre('save', function (next) {
  const song = this
  // 將前端以JSON字串形式傳回來的scoreHiHat、scoreSnare、scoreKick 恢復原始數據結構
  song.scoreHiHat = JSON.parse(song.scoreHiHat)
  song.scoreSnare = JSON.parse(song.scoreSnare)
  song.scoreKick = JSON.parse(song.scoreKick)
  next()
})

export default model('songs', schema)
