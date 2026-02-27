"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, ShoppingCart, Search, User, LogOut, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getGuestCart } from '@/lib/guest-cart'
import { api } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, loading } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  useEffect(() => {
    const updateCounts = () => {
      if (user) {
        fetchCounts()
      } else {
        // Guest cart
        const guestCart = getGuestCart()
        setCartCount(guestCart.reduce((sum, item) => sum + item.quantity, 0))
        setWishlistCount(0)
        setPendingOrdersCount(0)
      }
    }
    updateCounts()
    window.addEventListener('cart-updated', updateCounts)
    return () => window.removeEventListener('cart-updated', updateCounts)
  }, [user])

  const fetchCounts = async () => {
    try {
      const [cart, wishlist, pending] = await Promise.all([
        api.getCart(),
        api.getWishlist(),
        api.getPendingOrdersCount()
      ])
      setCartCount(cart.total_items || 0)
      setWishlistCount(wishlist.length || 0)
      setPendingOrdersCount(pending.count || 0)
    } catch (error) {
      console.error('Failed to fetch counts:', error)
    }
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/meher.webp"
              alt="Meher"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="hidden md:flex relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="hidden md:flex relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>
            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                    {pendingOrdersCount > 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Pending Orders: {pendingOrdersCount}
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/login">
                  <Button variant="outline" className="hidden md:flex">
                    Login
                  </Button>
                </Link>
              )
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/cart"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart {cartCount > 0 && <Badge variant="destructive">{cartCount}</Badge>}
              </Link>
              <Link
                href="/wishlist"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist {wishlistCount > 0 && <Badge variant="destructive">{wishlistCount}</Badge>}
              </Link>
              {!loading && (
                user ? (
                  <>
                    {pendingOrdersCount > 0 && (
                      <div className="text-sm text-muted-foreground py-2">
                        Pending Orders: {pendingOrdersCount}
                      </div>
                    )}
                    <Link
                      href="/profile"
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="justify-start"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
