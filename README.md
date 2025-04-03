# @daveyplate/better-auth-tanstack

Tanstack Query hooks for Better Auth. Provides tighter control of when requests are made, optimistic mutations, and supports offline caching for offline auth via Persist Cients.

More to come soon... (e.g. more SSR prefetches, organization & stripe plugin hooks, SWR port...)

## Prerequisites

First, you need to install and integrate [Better Auth](https://better-auth.com) & [Tanstack Query](https://tanstack.com/query).

## Installation

pnpm
```bash
pnpm add @daveyplate/better-auth-tanstack@latest
```

npm
```bash
npm install @daveyplate/better-auth-tanstack@latest
```

For the `useSession` hook to refresh on sign in, sign out, and sign up without email verification, you must manually call `refetch` or `queryClient.resetQueries()` for `["session"]` in the `onSuccess` callback of each of those functions or after awaiting and checking for an error.

If you are using Next.js App Router with protected middleware routes, `router.refresh()` is required as well to clear the router cache.

[@daveyplate/better-auth-ui](https://better-auth-ui.com) Better Auth UI supports better-auth-tanstack out of the box! You simply need to use the `AuthUIProviderTanstack`.

## Setting up the AuthQueryProvider

First, you need to set up the `AuthQueryProvider` in your application. This provider will supply the necessary context for the hooks to function. Requires `"use client"` directive for Next.js App Router.

### app/providers.tsx
```tsx
"use client"

import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <AuthQueryProvider>
            {children}
        </AuthQueryProvider>
    )
}
```

### app/layout.tsx
```tsx
import { Providers } from "./providers"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <Providers>
            {children}
        </Providers>
    )
}
```

## AuthQueryProvider Props

The `AuthQueryProvider` component accepts the following props. The default `staleTime` for `useSession` is 60 seconds and for `useToken` is 10 minutes.

| Prop                  | Type                                                                 | Description                                                                 |
|-----------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| queryOptions?        | UseQueryOptions                           | Optional query options for the provider.                                    |
| sessionQueryOptions? | UseQueryOptions                           | Optional query options for the session query.                               |
| tokenQueryOptions?   | UseQueryOptions                           | Optional query options for the token query.                                 |
| sessionKey?          | string[]                                                           | Optional key for the session query. The default is `["session"]`.                                         |
| tokenKey?            | string[]                                                           | Optional key for the token query. The default is `["token"]`.                                           |
| listAccountsKey?            | string[]                                                           | Optional key for the listAccounts query. The default is `["list-accounts"]`.                                           |
| listSessionsKey?            | string[]                                                           | Optional key for the listSessions query. The default is `["list-sessions"]`.                                           |
| optimistic?            | boolean                                                           | Whether to perform optimistic updates. The default is `true`.                                           |
| refetchOnMutate?            | boolean                                                           | Whether to refetch after mutates. The default is `true`.                                           |


## Creating `auth-hooks.ts`

Create a file named `auth-hooks.ts` and set up the hooks using `createAuthHooks` function. This function takes the `authClient` instance and returns the hooks with full type safety and inference from your `authClient`.

```ts
import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { authClient } from "@/lib/auth-client"

const auth = createAuthHooks(authClient)
export default auth

export const {
    useSession,
    usePrefetchSession,
    useToken,
    useListAccounts,
    useListSessions,
    useListDeviceSessions,
    useListPasskeys,
    useUpdateUser,
    useUnlinkAccount,
    useRevokeOtherSessions,
    useRevokeSession,
    useRevokeSessions,
    useSetActiveSession,
    useRevokeDeviceSession,
    useDeletePasskey,
    useAuthQuery,
    useAuthMutation
} = auth
```

## Using the Hooks

### useSession

The `useSession` hook is used to fetch the session.

#### Props

| Prop      | Type                                                                 | Description                                  |
|-----------|----------------------------------------------------------------------|----------------------------------------------|
| options?   | UseQueryOptions | Optional query options for the session query.|

#### Example

```tsx
import { useSession } from "@/hooks/auth-hooks"

function MyComponent() {
    const { 
        data: sessionData, 
        session, 
        user, 
        isPending, 
        refetch, 
        error
    } = useSession()

    if (isPending) return <div>Loading...</div>

    return <div>Welcome, {user?.email}</div>
}
```

### useToken

The `useToken` hook is used to fetch the JWT token if better-auth JWT plugin is enabled.

#### Props

| Prop      | Type                                                                 | Description                                  |
|-----------|----------------------------------------------------------------------|----------------------------------------------|
| options?   | UseQueryOptions | Optional query options for the token query.  |

#### Example

```tsx
import { useToken } from "@/hooks/auth-hooks"

function MyComponent() {
    const { data, token, payload, isPending, error } = useToken()

    if (isPending) return <div>Loading...</div>

    return <div>JWT: {token}</div>
}
```

## useListAccounts

The `useListAccounts` hook allows you to list and manage user accounts linked to different providers.

### Usage

```ts
import { useListAccounts } from "@/hooks/auth-hooks"

function AccountList() {
  const { data: accounts, isPending, error } = useListAccounts()

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Linked Accounts</h2>
      <ul>
        {accounts?.map(account => (
          <li key={account.id}>
            {account.provider}
            <button onClick={() => unlinkAccount(account.provider)}>Unlink</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

Use the `unlinkAccount` function to unlink an account by provider ID. This is the optimistic example. See below for non-optimistic examples.

```ts
unlinkAccount({ providerId: "github" })
```

## useListSessions

```ts
import { useListSessions, useRevokeSession } from "@/hooks/auth-hooks"

function SessionList() {
  const { 
    data: sessions, 
    isPending,
    error
   } = useListSessions()
   const { mutate: revokeSession } = useRevokeSession()

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Active Sessions</h2>
      <ul>
        {sessions?.map(session => (
          <li key={session.id}>
            {session.userAgent}
            <button onClick={() => revokeSession(session.token)}>Revoke</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## useListDeviceSessions

```ts
  const { 
    data: deviceSessions, 
    isPending,
    error
   } = useListDeviceSessions()
```

## useListPasskeys

```ts
const {
    data: passkeys,
    isPending,
    error
} = useListPasskeys()
```

### Mutations - updateUser

#### Optimistic example

Optimistic example to update user's name with no loaders. Optimistically updates the user in the Tanstack Query cache instantly. Revalidates on success, reverts on error. Uses the default setting for `optimistic` (true) prop on `AuthQueryProvider`.

This package supports the Tanstack Query global error configuration:

`queryClient.getQueryCache().config.onError` gets called automatically, so you can set up global error toasts to show `error.message || error.statusText`. [Tanstack Query Global Error Callbacks](https://tkdodo.eu/blog/react-query-error-handling#the-global-callbacks)

```tsx
"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession, useUpdateUser } from "@/hooks/auth-hooks"

export default function SettingsPage() {
    const { user, isPending } = useSession()
    const { mutate: updateUser, error: updateError } = useUpdateUser()
    const [disabled, setDisabled] = useState(true)

    const updateProfile = (formData: FormData) => {
        const name = formData.get("name") as string

        setDisabled(true)
        updateUser({ name: name })
    }

    useEffect(() => {
        if (updateError) {
            // Show an error Toast
        }
    }, [updateError])

    if (isPending || !user) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-4 my-auto">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        Change Name
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        action={updateProfile}
                        className="flex flex-col gap-4 items-start"
                    >
                        <Label htmlFor="name">
                            Name
                        </Label>

                        <Input
                            defaultValue={user.name}
                            name="name"
                            placeholder="Name"
                            onChange={() => setDisabled(false)}
                        />

                        <Button disabled={disabled}>
                            Save
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
```

#### Unoptimistic example

Unoptimistic example with `useActionState` to show loaders for updating a user's name. Set `optimistic` to `false` in the `AuthQueryProvider` props to disable optimistic cache updates. Sends a request to `/api/auth/update-user` then updates the user in the Tanstack Query cache after the request is successful. Then revalidates the session by refetching.

Note that we use `updateUserAsync`

```tsx
"use client"

import { Loader2 } from "lucide-react"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession, useUpdateUser } from "@/hooks/auth-hooks"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    const { user, isPending } = useSession()
    const { mutate: updateUser, error: updateError } = useUpdateUser()
    const [disabled, setDisabled] = useState(true)

    type ActionState = Parameters<typeof updateUser>[0]

    const updateProfile = async (_: ActionState, formData: FormData) => {
        const name = formData.get("name") as string

        setDisabled(true)

        const { error } = await updateUserAsync({ name, fetchOptions: { throw: false } })

        if (error) {
            // Show an error Toast or throw an error to an ErrorBoundary

            setDisabled(false)
        }

        return { name } as ActionState
    }

    const [state, action, isSubmitting] = useActionState(updateProfile, {})

    // useEffect(() => {
    //     if (updateError) {
    //          setDisabled(false)
    //         // Show an error Toast
    //     }
    // }, [updateError])

    if (isPending || !user) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-4 my-auto">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        Change Name
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        action={action}
                        className="flex flex-col gap-4 items-start"
                    >
                        <Label htmlFor="name">
                            Name
                        </Label>

                        <Input
                            defaultValue={state?.name ?? user.name}
                            name="name"
                            placeholder="Name"
                            onChange={() => setDisabled(false)}
                        />

                        <Button disabled={isSubmitting || disabled}>
                            <span className={cn(isSubmitting && "opacity-0")}>
                                Save
                            </span>

                            {isSubmitting && <Loader2 className="animate-spin absolute" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
```

### Server-Side Prefetch - Advanced Usage
If you want to use a hybrid prefetching strategy, this is totally supported.

[Tanstack Query - Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)

### SSR prefetchSession

The `prefetchSession` function is used in the server to prefetch session data and store it in the query client.

#### Props

| Prop    | Type     | Description                      |
|-------------|---------------|-------------------------------------------------------|
| auth    | Auth     | The server auth instance.          |
| queryClient | QueryClient  | The query client instance.              |
| headers  | Headers   | The headers object from the server request. |
| queryKey?  | string[]  | Optional key for the session query. Default is `["session"]`. |

#### RSC Example


```ts
import { prefetchSession } from "@daveyplate/better-auth-tanstack/server"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { headers } from "next/headers"

import { betterAuth } from "better-auth"
import { auth } from "@/lib/auth"

export default async function Page() {
    const queryClient = new QueryClient()

    const { data, session, user } = await prefetchSession(
        auth, queryClient, await headers()
    )

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ClientPage />
        </HydrationBoundary>
    )
}
```

### useAuthQuery
```ts
import type { AnyUseQueryOptions } from "@tanstack/react-query"
import { useAuthQuery } from "@/lib/auth-hooks"
import { authClient } from "@/lib/auth-client"

export function useListDeviceSessions(
    options?: Partial<AnyUseQueryOptions>
) {
    return useAuthQuery({
        queryKey: ["device-sessions"],
        queryFn: authClient.multiSession.listDeviceSessions,
        options
    })
}
```

### useAuthMutation
```ts
import { AuthQueryContext, type AuthQueryOptions } from "@daveyplate/better-auth-tanstack"
import { authClient } from "@/lib/auth-client"
import { useAuthMutation } from "@/lib/auth-hooks"

export function useUpdateUser(
    options?: Partial<AuthQueryOptions>
) {
    type SessionData = typeof authClient["$Infer"]["Session"]
    const { sessionKey: queryKey } = useContext(AuthQueryContext)

    return useAuthMutation({
        queryKey,
        mutationFn: authClient.updateUser,
        optimisticData: (params, previousSession: SessionData) => ({
            ...previousSession,
            user: { ...previousSession.user, ...params }
        }),
        options
    })
}
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
