export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background/80 via-destructive/80 to-background/80 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
