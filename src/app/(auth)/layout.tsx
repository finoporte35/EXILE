export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background/40 via-destructive/05 to-background/40 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
