"use client";

import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const router = useRouter();
  const { logout, user, isLoading } = useAuth();

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Protected route available only for authenticated users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 text-sm">
              <p>
                <span className="font-medium">User ID:</span> {user?.id ?? "N/A"}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user?.email ?? "N/A"}
              </p>
              <p>
                <span className="font-medium">Name:</span> {user?.name ?? "N/A"}
              </p>
            </div>

            <Button
              variant="outline"
              disabled={isLoading}
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
