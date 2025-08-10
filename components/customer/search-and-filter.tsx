"use client"

import { useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type Category = { id: string; name: string; emoji?: string }

export interface SearchAndFilterProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (id: string) => void
  search: string
  onSearchChange: (value: string) => void
}

export function SearchAndFilter({
  categories,
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
}: SearchAndFilterProps) {
  const CategoryRow = useMemo(
    () => (
      <ScrollArea className="w-full">
        <div className="flex gap-2 px-4 pb-3 min-w-max">
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={activeCategory === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(c.id)}
              className={`flex-shrink-0 h-10 rounded-full ${
                activeCategory === c.id
                  ? "bg-orange-500 text-white hover:opacity-90"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              {c.emoji && <span className="text-base mr-1">{c.emoji}</span>}
              <span className="font-medium text-sm">{c.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    ),
    [categories, activeCategory, onCategoryChange],
  )

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b shadow-sm">
      <div className="p-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm món theo tên, thành phần..."
            className="pl-9"
            aria-label="Tìm món"
          />
        </div>
      </div>
      {CategoryRow}
    </div>
  )
}
