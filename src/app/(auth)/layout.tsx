export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background/70 via-destructive/40 to-background/70 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
