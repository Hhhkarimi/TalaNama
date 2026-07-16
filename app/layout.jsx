import "@fontsource-variable/vazirmatn";
import "./globals.css";

export const metadata = {
  title: "طلانما | تحلیل بازار طلا",
  description: "داشبورد تحلیل روند اونس جهانی و طلای ایران"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
