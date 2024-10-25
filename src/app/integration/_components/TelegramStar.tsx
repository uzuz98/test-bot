import React from "react";
import { HandleCard } from "./HandleCard";
import axios from "axios";
import { getTelegramUser } from "@/context/services";

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