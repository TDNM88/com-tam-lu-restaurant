"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Visual strip of featured dishes.
 * Uses the exact Source URLs provided by you (as requested).
 */
export function FeaturedStrip() {
  const items = [
    {
      title: "Sườn nướng than",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cach-uop-suon-nuong-com-tam-ngon.jpg-3yyPdNm3Wxvpoxr9xia2TQCZ9S9fl3.jpeg",
      alt: "Sườn nướng than cháy cạnh",
    },
    {
      title: "Cơm tấm sườn bì chả",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0081-scaled.jpg-blkJxtC7dC4BiZyQel7zp5ieUIWdec.jpeg",
      alt: "Đĩa cơm tấm sườn bì chả ngon",
    },
    {
      title: "Cơm tấm trứng ốp la",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2023_10_29_638341413351086151_cach-uop-suon-com-tam-sb0Hh8yQD45D6vxXDNlumnkXTKGvoz.webp",
      alt: "Cơm tấm trứng ốp la và sườn",
    },
    {
      title: "Poster khuyến mãi 19K",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_20250810_021232.png-t2pF3h5kiK7T7tbHCRWo6xZsY1DzA3.jpeg",
      alt: "Poster khuyến mãi cơm sườn 19K",
    },
    {
      title: "Combo đủ vị",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/khoa-hoc-nau-com-tam-suon-bi-cha-de-mo-quan-kinh-doanh-7.jpg-NDBxyUteqeDr2TsasU7FDvo4L9G9Nk.jpeg",
      alt: "Combo cơm tấm đủ vị",
    },
  ]

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex gap-3 min-w-max">
        {items.map((it, i) => (
          <Card key={i} className="w-[220px] shrink-0">
            <CardContent className="p-2">
              <div className="relative w-full h-[130px] rounded-md overflow-hidden bg-muted">
                <img
                  src={it.src || "/placeholder.svg"}
                  alt={it.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-medium line-clamp-1">{it.title}</p>
                <Badge variant="secondary">Hot</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
