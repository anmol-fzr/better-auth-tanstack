"use client"

import { AnyUseQueryOptions } from "@tanstack/react-query"
import { ReactNode, createContext } from "react"

export type AuthQueryOptions = {
    queryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    sessionQueryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    tokenQueryOptions?: Omit<AnyUseQueryOptions, "queryFn" | "queryKey">
    sessionKey?: string[]
    tokenKey?: string[]
}

export const AuthQueryContext = createContext<AuthQueryOptions>({})

export const AuthQueryProvider = ({ children, ...props }: { children: ReactNode } & AuthQueryOptions) => {
    return (
        <AuthQueryContext.Provider value={{ ...props }}>
            {children}
        </AuthQueryContext.Provider>
    )
}