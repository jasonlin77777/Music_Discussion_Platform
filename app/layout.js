import Navbar from "./components/Navbar";
import "./globals.css";
import { Providers } from "./providers"; // Import the new Providers component

export const metadata = {
  title: "MDP 音樂論壇",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers> {/* Wrap the content with Providers */}
          <Navbar />
          <main style={{ padding: 20 }}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
