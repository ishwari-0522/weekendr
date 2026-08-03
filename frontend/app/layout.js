import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import HeaderNav from "../components/layout/HeaderNav";
import { AuthProvider } from "../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "WEEKENDR - Discover & Plan Your Weekends",
  description: "WEEKENDR is an AI-powered weekend itinerary planner and memory sharing platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        <AuthProvider>
          
          {/* Header Client Component */}
          <HeaderNav />

          {/* Main Content Area (Responsive Container) */}
          <main className="flex-1 flex flex-col w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative">
            {children}
          </main>
          
          {/* Global Portals Roots */}
          <div id="toast-root"></div>
          <div id="modal-root"></div>
          <div id="loading-root"></div>
          <div id="drawer-root"></div>

          {/* Minimal Footer */}
          <footer className="border-t border-border bg-card py-6 relative z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} WEEKENDR. All rights reserved.
            </div>
          </footer>
          
        </AuthProvider>
      </body>
    </html>
  );
}
