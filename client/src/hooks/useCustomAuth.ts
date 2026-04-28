import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function useCustomAuth() {
  const { data: session, isLoading } = trpc.auth.session.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
  });
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.customLogout.useMutation({
    onSuccess: () => navigate("/login"),
  });

  return {
    session,
    isLoading,
    isAdmin: session?.role === "admin",
    isReseller: session?.role === "reseller",
    isAuthenticated: !!session,
    logout: () => logoutMutation.mutate(),
  };
}
