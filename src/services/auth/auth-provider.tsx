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
import { notificationsQueryKeys } from "@/app/[language]/profile/queries/notifications-queries";

function AuthProvider(props: PropsWithChildren<{}>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const fetchBase = useFetch();
  const queryClient = useQueryClient();

  const setTokensInfo = useCallback((tokensInfo: TokensInfo) => {
    setTokensInfoToStorage(tokensInfo);
    if (!tokensInfo) {
      setUser(null);
    }
  }, []);

  // Clear notification cache on logout/user change
  const clearUserSpecificCache = useCallback(() => {
    // Remove all notification queries
    queryClient.removeQueries({ queryKey: notificationsQueryKeys.list().key });
    queryClient.removeQueries({
      queryKey: notificationsQueryKeys.unreadCount().key,
    });

    // You can add more user-specific queries to clear here as needed
  }, [queryClient]);

  const logOut = useCallback(async () => {
    const tokens = getTokensInfo();

    // Clear user-specific query cache first
    clearUserSpecificCache();

    // Then perform logout
    if (tokens?.token) {
      await fetchBase(AUTH_LOGOUT_URL, {
        method: "POST",
      });
    }

    // Clear tokens last
    setTokensInfo(null);
  }, [setTokensInfo, fetchBase, clearUserSpecificCache]);

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

        // Clear previous user's cache before setting new user
        clearUserSpecificCache();

        // Set the new user
        setUser(data);
      }
    } finally {
      // Mark auth as loaded regardless of outcome
      setIsLoaded(true);
    }
  }, [fetchBase, logOut, clearUserSpecificCache]);

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
          clearUserSpecificCache();
        }
        setUser(newUser);
      },
      logOut,
    }),
    [logOut, user, clearUserSpecificCache]
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
