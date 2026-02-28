"use client";

import React, { useEffect } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <RegisterForm />
    </div>
  );
}
