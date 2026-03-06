"use client";

import React from "react";
import { Button, Result } from "antd";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHome?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error while loading this page. Please try again later.",
  onRetry,
  showHome = true,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 animate-in fade-in duration-500">
      <Result
        status="error"
        icon={
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-50 text-red-500 shadow-sm">
              <AlertCircle size={48} />
            </div>
          </div>
        }
        title={<h2 className="text-2xl font-bold text-slate-800">{title}</h2>}
        subTitle={<p className="text-slate-500 max-w-md mx-auto">{message}</p>}
        extra={
          <div className="flex items-center justify-center gap-4 mt-4">
            {onRetry && (
              <Button
                type="primary"
                icon={<RefreshCw size={16} />}
                onClick={onRetry}
                className="flex items-center gap-2 h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-100 transition-all active:scale-95"
              >
                Try Again
              </Button>
            )}
            {showHome && (
              <Link href="/">
                <Button
                  icon={<Home size={16} />}
                  className="flex items-center gap-2 h-10 px-6 rounded-lg font-bold border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Back to Dashboard
                </Button>
              </Link>
            )}
          </div>
        }
      />
    </div>
  );
}
