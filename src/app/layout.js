import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileWrapper from "./MobileWrapper";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Zenth Salon",
  description: "This web app is optimized for mobile devices only.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MobileWrapper>
          <Navbar />
          {children}
        </MobileWrapper>
      </body>
    </html>
  );
}