"use client";

import { useAuthContext } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/cn";
import {
  User,
  Mail,
  Shield,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Building2,
  FileText,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-slate-500">Failed to load profile.</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full p-8 px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your profile and account preferences.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Panel */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="overflow-hidden border-slate-200/60 shadow-md">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 flex justify-center">
                <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.display_name} />
                  ) : null}
                  <AvatarFallback className="bg-blue-600 text-2xl font-bold text-white">
                    {getInitial(user.display_name || user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {user.display_name}
              </h2>
              <p className="text-sm text-slate-500">@{user.username}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {user.is_admin && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                )}
                {user.is_global_admin && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    Global Admin
                  </Badge>
                )}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    Org ID: {user.org_id || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200/60 shadow-md">
            <CardHeader className="border-b border-slate-100 py-4">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Full Name
                  </label>
                  <p className="mt-1 font-medium text-slate-900">
                    {user.display_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Username
                  </label>
                  <p className="mt-1 font-medium text-slate-900">
                    @{user.username}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Description
                  </label>
                  <p className="mt-1 text-slate-600 italic">
                    {user.description || (
                      <span className="text-slate-400 italic font-normal">
                        No description provided
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-md">
            <CardHeader className="border-b border-slate-100 py-4">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </label>
                    <p className="font-medium text-slate-900">
                      {user.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-10 w-10 flex items-center justify-center rounded-lg",
                      user.is_verified ? "bg-green-50" : "bg-amber-50",
                    )}
                  >
                    {user.is_verified ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Verified
                    </label>
                    <p className="font-medium text-slate-900">
                      {user.is_verified ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-md">
            <CardHeader className="border-b border-slate-100 py-4">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Last Login
                    </label>
                    <p className="text-sm font-medium text-slate-700">
                      {formatDate(user.last_login_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Joined Date
                    </label>
                    <p className="text-sm font-medium text-slate-700">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
