import React from "react";
import { HandleCard } from "./HandleCard";
import axios from "axios";

const SAMPLE_TELE_BOT = 'user=%7B%22id%22%3A9898989898%2C%22first_name%22%3A%22Coin98%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22test_c98%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D'

const getTelegramUser = ()=> {
  try {
    const searchData = new URLSearchParams(window.Telegram?.WebApp?.initData)
    const user = searchData.get('user')

    if (!user) {
      throw Error('not found')
    }
    return JSON.parse(user)
  } catch (e) {
    const searchData = new URLSearchParams(SAMPLE_TELE_BOT)
    // Default user for testing on browser
    return JSON.parse(searchData.get('user') || '')
  }
}


export const TelegramStar = () => { 
  const handleBuyStar = async () => {
    const user = getTelegramUser()

    axios.post('https://payment-api-chi.vercel.app/request-payment', {
      "chatId": `${user.id}`,
      product: {
        "title":"Victoria xao quyet",
        "description": "Victoria xao quyet ngon hon ghe cua ban",
        "currency" : "XTR",
        "variants": [{
            "amount": 2,
            "label": "Hãy đến với anh một đêm nào"
        }],
        "photo_url": "https://photo-cms-smoney.epicdn.me/w700/Uploaded/2024/jhvkbun/2024_03_08/n-znews-2157.jpg",
        "start_parameter": "hcfhjgvcghvhjfvhjgvjh"
      }
    })
  }

  return (
    <HandleCard
      title="TELEGRAM STAR"
      btnA={{
        codeExample: '',
        description: 'Buy Star',
        handle: handleBuyStar,
      }}
    />
  )
}