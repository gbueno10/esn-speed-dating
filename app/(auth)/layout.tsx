export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex items-center justify-center bg-gradient-to-br from-pink-500/10 via-background to-purple-500/10 p-4">
      {children}
    </div>
  );
}
