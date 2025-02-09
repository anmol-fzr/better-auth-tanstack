# @daveyplate/better-auth-tanstack

Tanstack Query hooks for Better Auth session & JWT token.

More to come soon... (e.g. more SSR prefetches, organization plugin hooks, multisession plugin, SWR port, tighter better-auth-ui integration)

## Prerequisites

First, you need to install and integrate [Better Auth](https://better-auth.com) & [Tanstack Query](https://tanstack.com/query).

## Installation

```bash
npm install @daveyplate/better-auth-tanstack
```

For the `useSession` hook to refresh on sign in, sign out, and sign up without email verification, you must manually call `refetch`, `queryClient.invalidateQueries()` for `["session"]`, or `queryClient.clear()` in the `onSuccess` callback of each of those functions or after awaiting and checking for an error.

If you are using Next.js App Router with protected middleware routes, `router.refresh()` is required as well to clear the router cache.

[@daveyplate/better-auth-ui](https://github.com/daveyplate/better-auth-ui) The AuthCard accepts an `onSessionChange` prop which is a great place to refetch for all of the auth functions, where it shows `onSessionChange={() => router.refresh()}` in the App Router example.

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

The `AuthQueryProvider` component accepts the following props. The default `staleTime` for sessions is 30 seconds and for JWT tokens is 10 minutes.

| Prop                  | Type                                                                 | Description                                                                 |
|-----------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| queryOptions?        | UseQueryOptions                           | Optional query options for the provider.                                    |
| sessionQueryOptions? | UseQueryOptions                           | Optional query options for the session query.                               |
| tokenQueryOptions?   | UseQueryOptions                           | Optional query options for the token query.                                 |
| sessionKey?          | string[]                                                           | Optional key for the session query. The default is `["session"]`.                                         |
| tokenKey?            | string[]                                                           | Optional key for the token query. The default is `["token"]`.                                           |
| listAccountsKey?            | string[]                                                           | Optional key for the listAccounts query. The default is `["list-accounts"]`.                                           |
| listSessionsKey?            | string[]                                                           | Optional key for the listSessions query. The default is `["list-sessions"]`.                                           |
| optimisticMutate?            | boolean                                                           | Whether to perform optimistic updates. The default is `true`.                                           |


## Creating `use-auth-hooks.ts`

Create a file named `use-auth-hooks.ts` and set up the hooks using `createAuthHooks` function. This function takes the `authClient` instance and returns the hooks with full type safety and inference from your `authClient`.

```ts
import { createAuthClient } from "better-auth/react"
import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { authClient } from "@/lib/auth-client"

export const { 
    useSession, 
    usePrefetchSession, 
    useToken,
    useListAccounts,
    useListSessions
} = createAuthHooks(authClient)
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
import { useSession } from "@/hooks/use-auth-hooks"

function MyComponent() {
    const { 
        data: sessionData, 
        session, 
        user, 
        isPending, 
        refetch, 
        error, 
        updateUser, 
        updateError 
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
import { useToken } from "@/hooks/use-auth-hooks"

function MyComponent() {
    const { token, isPending } = useToken()

    if (isPending) return <div>Loading...</div>

    return <div>JWT: {token}</div>
}
```

## useListAccounts

The `useListAccounts` hook allows you to list and manage user accounts linked to different providers.

### Usage

```ts
import { useListAccounts } from "@/hooks/use-auth-hooks"

function AccountList() {
  const { accounts, unlinkAccount, unlinkAccountError, isPending, error } = useListAccounts()

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
unlinkAccount("github")
  .then({ error } => {
    if (error) {
      console.error("Failed to unlink account:", error)
    } else {
      console.log("Account unlinked successfully")
    }
  })
```

## useListSessions

```ts
import { useListSessions } from "@/hooks/use-auth-hooks"

function SessionList() {
  const { 
    sessions, 
    revokeSession, 
    revokeSessionError,
    revokeSessions,
    revokeSessionsError,
    revokeOtherSessions,
    revokeOtherSessionsError,
    isPending, 
    error 
   } = useListSessions()

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

### Mutations - updateUser

#### Optimistic example

Optimistic example to update user's name with no loaders. Only sends a single HTTP request to `/api/auth/update-user`. Optimistically updates the user in the Tanstack Query cache instantly. Reverts on error. Uses the default setting for `optimisticMutate` (true) prop on `AuthQueryProvider`.

Errors can be handled by showing an error Toast or throwing an error to an ErrorBoundary. We also support the Tanstack Query global error configuration:

`queryClient.getQueryCache().config.onError` gets called automatically, so you can set up global error toasts. [Tanstack Query Global Error Callbacks](https://tkdodo.eu/blog/react-query-error-handling#the-global-callbacks)

```tsx
"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "@/hooks/use-auth-hooks"

export default function SettingsPage() {
    const { user, isPending, updateUser, updateError } = useSession()
    const [disabled, setDisabled] = useState(true)

    const updateProfile = (formData: FormData) => {
        const name = formData.get("name") as string

        setDisabled(true)
        updateUser({ name: name }).then(({ error }) => {
            setDisabled(!error)

            // Show an error Toast
        })
    }

    // useEffect(() => {
    //     if (updateError) {
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

Unoptimistic example with `useActionState` to show loaders for updating a user's name. Set `optimisticMutate` to `false` in the `AuthQueryProvider` props to disable optimistic cache updates. Sends a request to `/api/auth/update-user` then updates the user in the Tanstack Query cache after the request is successful. Then revalidates the session by sending another request to `/api/auth/get-session`.
```tsx
"use client"

import { Loader2 } from "lucide-react"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "@/hooks/use-auth-hooks"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    const { user, isPending, updateUser, updateError } = useSession()
    const [disabled, setDisabled] = useState(true)

    type ActionState = Parameters<typeof updateUser>[0]

    const updateProfile = async (_: ActionState, formData: FormData) => {
        const name = formData.get("name") as string

        setDisabled(true)

        const { error } = await updateUser({ name })

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

## License

This project is licensed under the MIT License. See the LICENSE file for details.
