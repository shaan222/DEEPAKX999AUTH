'use client'

// AuthProvider is now in root layout, no need to wrap here
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

