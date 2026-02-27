import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">INFORMATION</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-accent transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-accent transition-colors">
                  Refund and Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-accent transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">About Meher Foods</h3>
            <p className="text-sm leading-relaxed">
              Meher Foods offers fresh raw spices, premium dry fruits, flavorful recipe masalas, delicious desserts, and
              quality essentials, ensuring top taste, freshness, and excellence in every product.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Got a question?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Phone: +92-330-2532666</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Email: mehermasala@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Our Locations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Shop 1: KMC Market, Near Bank Al Habib, Soldier Bazar, Karachi</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Shop 2: 12/65, Near Meezan Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/20 text-center text-sm">
          <p>© {new Date().getFullYear()} Meher Foods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
