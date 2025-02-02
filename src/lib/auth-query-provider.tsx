"use client"

import { AnyUseQueryOptions } from "@tanstack/react-query"
import { ReactNode, createContext } from "react"

export type AuthQueryContextType = {
    queryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    sessionQueryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    tokenQueryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    sessionKey?: string[]
    tokenKey?: string[]
}

export const AuthQueryContext = createContext<AuthQueryContextType>({})

export const AuthQueryProvider = ({ children, ...props }: { children: ReactNode } & AuthQueryContextType) => {
    return (
        <AuthQueryContext.Provider value={{ ...props }}>
            {children}
        </AuthQueryContext.Provider>
    )
}