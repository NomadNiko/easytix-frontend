// src/services/auth/auth-provider.tsx
"use client";
import { User } from "@/services/api/types/user";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthActionsContext,
  AuthContext,
  AuthTokensContext,
  TokensInfo,
} from "./auth-context";
import useFetch from "@/services/api/use-fetch";
import { AUTH_LOGOUT_URL, AUTH_ME_URL } from "@/services/api/config";
import HTTP_CODES_ENUM from "../api/types/http-codes";
import {
  getTokensInfo,
  setTokensInfo as setTokensInfoToStorage,
} from "./auth-tokens-info";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

function AuthProvider(props: PropsWithChildren<{}>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const fetchBase = useFetch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const setTokensInfo = useCallback((tokensInfo: TokensInfo) => {
    setTokensInfoToStorage(tokensInfo);
    if (!tokensInfo) {
      setUser(null);
    }
  }, []);

  // Clear all cache on logout/user change
  const clearAllCache = useCallback(() => {
    // Clear all React Query cache
    queryClient.clear();

    // Clear any browser storage cache if needed
    if (typeof window !== "undefined") {
      // Clear localStorage cache items (except tokens which are handled separately)
      const keysToKeep = ["tokens"];
      Object.keys(localStorage).forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [queryClient]);

  const logOut = useCallback(async () => {
    const tokens = getTokensInfo();

    // Clear all cache first
    clearAllCache();

    // Then perform logout API call
    if (tokens?.token) {
      try {
        await fetchBase(AUTH_LOGOUT_URL, {
          method: "POST",
        });
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn("Logout API call failed:", error);
      }
    }

    // Clear tokens last
    setTokensInfo(null);

    // Redirect to root page
    router.push("/");
  }, [setTokensInfo, fetchBase, clearAllCache, router]);

  // Load user data once at initialization
  const loadData = useCallback(async () => {
    const tokens = getTokensInfo();
    try {
      if (tokens?.token) {
        const response = await fetchBase(AUTH_ME_URL, {
          method: "GET",
        });
        if (response.status === HTTP_CODES_ENUM.UNAUTHORIZED) {
          logOut();
          return;
        }
        const data = await response.json();

        // Set the new user
        setUser(data);
      }
    } finally {
      // Mark auth as loaded regardless of outcome
      setIsLoaded(true);
    }
  }, [fetchBase, logOut]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const contextValue = useMemo(
    () => ({
      isLoaded,
      user,
    }),
    [isLoaded, user]
  );

  const contextActionsValue = useMemo(
    () => ({
      setUser: (newUser: User) => {
        // If user is changing (different ID), clear cache first
        if (user && newUser && user.id !== newUser.id) {
          clearAllCache();
        }
        setUser(newUser);
      },
      logOut,
    }),
    [logOut, user, clearAllCache]
  );

  const contextTokensValue = useMemo(
    () => ({
      setTokensInfo,
    }),
    [setTokensInfo]
  );

  // Show nothing until auth is loaded to prevent flashing
  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthActionsContext.Provider value={contextActionsValue}>
        <AuthTokensContext.Provider value={contextTokensValue}>
          {props.children}
        </AuthTokensContext.Provider>
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}

export default AuthProvider;
