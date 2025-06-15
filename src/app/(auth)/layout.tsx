export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background/60 via-destructive/30 to-background/60 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

