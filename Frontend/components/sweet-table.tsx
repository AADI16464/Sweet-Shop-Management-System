"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { type Sweet } from "@/lib/api/client"
import { getImageUrl } from "@/lib/utils"
import Image from "next/image"

interface SweetTableProps {
  sweets: Sweet[]
  onEdit: (sweet: Sweet) => void
  onDelete: (id: string) => void
}

export function SweetTable({ sweets, onEdit, onDelete }: SweetTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      onDelete(deleteId)
    } finally {
    setIsDeleting(false)
    setDeleteId(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sweets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No sweets found. Add your first sweet to get started!
                </TableCell>
              </TableRow>
            ) : (
              sweets.map((sweet) => (
                <TableRow key={sweet.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden border">
                        <Image
                          src={getImageUrl(sweet.imageUrl)}
                          alt={sweet.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span>{sweet.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sweet.category ? <Badge variant="outline">{sweet.category}</Badge> : <span>-</span>}
                  </TableCell>
                  <TableCell>₹{sweet.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={sweet.inStock && sweet.quantity > 0 ? "default" : "secondary"}>
                      {sweet.inStock && sweet.quantity > 0 ? `In Stock (${sweet.quantity})` : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(sweet)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(sweet.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sweet from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
