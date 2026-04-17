// Root layout — passes children through to [locale]/layout.tsx
// Required by Next.js even when using i18n with locale-based routing
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}