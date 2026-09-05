"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateBoard } from "@/hooks/use-boards"

export function CreateBoardDialog() {
  const router = useRouter()
  const createBoard = useCreateBoard()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const reset = () => {
    setTitle("")
    setDescription("")
  }

  const handleCreate = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    createBoard.mutate(
      { title: trimmed, description: description.trim() || undefined },
      {
        onSuccess: (board) => {
          setOpen(false)
          reset()
          router.push(`/boards/${board.id}`)
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus size={15} />
          New board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a board</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="board-title">Title</Label>
            <Input
              id="board-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product Launch Q1"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="board-description">Description</Label>
            <Textarea
              id="board-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this board for? (optional)"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createBoard.isPending}
          >
            {createBoard.isPending ? "Creating..." : "Create board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
