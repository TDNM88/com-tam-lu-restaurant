"use client"

import type React from "react"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function FeedbackDialog({
  orderId,
  onSubmit,
  trigger,
}: {
  orderId: string
  onSubmit: (data: { rating: number; comment?: string }) => void
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const handleSubmit = () => {
    onSubmit({ rating, comment: comment.trim() || undefined })
    setOpen(false)
    setComment("")
    setRating(5)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh giá đơn hàng #{orderId.slice(-4)}</DialogTitle>
          <DialogDescription>Góp ý giúp chúng tôi phục vụ tốt hơn.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`Đánh giá ${n} sao`} className="p-1">
                <Star className={`w-6 h-6 ${n <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Viết nhận xét (tuỳ chọn)"
            rows={4}
          />
          <Button onClick={handleSubmit} className="w-full bg-orange-500 hover:bg-orange-600">
            Gửi đánh giá
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
