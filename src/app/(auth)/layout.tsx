export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background/50 via-destructive/15 to-background/50 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
