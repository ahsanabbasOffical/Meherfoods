'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Shows a prompt to login or signup whenever a guest opens products pages.
// No session gating to ensure reliability while testing.
export function ProductAuthPopup() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (loading) return
    // If not logged in, show the popup; hide it if user logs in.
    setOpen(!user)
  }, [user, loading])

  const close = () => setOpen(false)

  return (
    <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login or Sign up</DialogTitle>
          <DialogDescription>
            Create an account to save your wishlist, track orders, and enjoy a faster checkout.
            You can also continue browsing as a guest.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            Continue browsing
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/register">Sign up</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
