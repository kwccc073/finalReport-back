// 引入套件
import { Schema, model } from 'mongoose'

const cities = ['臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市', '基隆市', '新竹市', '嘉義市', '宜蘭縣', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '花蓮縣', '臺東縣', '澎湖縣']
const reservations = ['電話預約', '官網預約', '社群預約', '現場登記', '其他預約方式']
// 定義電話號碼驗證的正則表達式
const phoneNumberRegex = /^0\d{9}$/

const schema = new Schema({
  // 縣市
  city: {
    type: String,
    required: [true, '縣市必填-model'],
    enum: {
      values: cities,
      message: '錯誤，查無縣市-model'
    }
  },
  // 地區
  district: {
    type: String,
    required: [true, '地區必填-model']
  },
  // 地址
  address: {
    type: String,
    required: [true, '地址必填-model']
  },
  // 名稱
  trainingRoomName: {
    type: String,
    required: [true, '名稱必填-model']
  },
  // 連絡電話
  phoneNumber: {
    type: String,
    required: [true, '連絡電話必填-model'],
    match: [phoneNumberRegex, '連絡電話格式不正確-model']
  },
  // 預約方式
  reservation: {
    type: String,
    required: [true, '預約必填-model'],
    enum: {
      values: reservations,
      message: '錯誤，查無預約方式-model'
    }
  },
  // 費用
  fee: {
    type: Number,
    required: [true, '費用必填-model'],
    default: 0 // 預設為 0
  }
}, {
  timestamps: true
})

export default model('trainingRooms', schema)
