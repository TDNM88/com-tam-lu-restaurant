"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, X, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ImageUploadProps {
  onImageUploaded?: (url: string) => void
  currentImage?: string
  itemName?: string
}

export function ImageUpload({ onImageUploaded, currentImage, itemName }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(currentImage || "")
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh!")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File không được vượt quá 5MB!")
      return
    }

    setUploading(true)

    try {
      const filename = `menu-items/${Date.now()}-${file.name}`

      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const blob = await response.json()
      setUploadedUrl(blob.url)
      onImageUploaded?.(blob.url)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload thất bại! Vui lòng thử lại.")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const removeImage = () => {
    setUploadedUrl("")
    onImageUploaded?.("")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Hình ảnh món ăn
        </CardTitle>
        <CardDescription>
          {itemName ? `Upload hình ảnh cho "${itemName}"` : "Upload hình ảnh chất lượng cao (tối đa 5MB)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadedUrl ? (
          <div className="relative">
            <img
              src={uploadedUrl || "/placeholder.svg"}
              alt="Uploaded image"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge className="bg-green-500 text-white">
                <Check className="w-3 h-3 mr-1" />
                Đã upload
              </Badge>
              <Button size="sm" variant="destructive" onClick={removeImage} className="w-8 h-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>

              <div>
                <p className="text-lg font-medium text-gray-700">Kéo thả hình ảnh vào đây</p>
                <p className="text-sm text-gray-500">hoặc click để chọn file</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="file-upload">
                  <Button variant="outline" disabled={uploading} className="cursor-pointer bg-transparent" asChild>
                    <span>{uploading ? "Đang upload..." : "Chọn hình ảnh"}</span>
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              <div className="text-xs text-gray-400">Hỗ trợ: JPG, PNG, WebP • Tối đa 5MB</div>
            </div>
          </div>
        )}

        {uploading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-sm text-gray-600">Đang upload...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
