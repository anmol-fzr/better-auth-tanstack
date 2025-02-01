# @daveyplate/better-auth-tanstack

Tanstack hooks for better-auth.

## Installation

First, you need to install [better-auth](https://better-auth.com).


```sh
npm install @daveyplate/better-auth-tanstack
```

## Setting up the AuthQueryProvider

First, you need to set up the AuthQueryProvider in your application. This provider will supply the necessary context for the hooks to function.

```tsx
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack"

function MyApp({ Component, pageProps }) {
    return (
        <AuthQueryProvider>
            <Component {...pageProps} />
        </AuthQueryProvider>
    )
}

export default MyApp
```

## Creating `use-auth-hooks.ts`

Create a file named `use-auth-hooks.ts` and set up the hooks using `createAuthHooks` function. This function takes the auth client instance and returns the hooks with full type safety and inference from your authClient.

```ts
import { createAuthClient } from "better-auth/react"
import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { authClient } from "@/lib/auth-client"

export const { useSession, useToken } = createAuthHooks(authClient)
```

## Using the Hooks

### useSession

The useSession hook is used to manage the session state.

#### Props

| Prop      | Type                                                                 | Description                                  |
|-----------|----------------------------------------------------------------------|----------------------------------------------|
| options   | UseQueryOptions | Optional query options for the session query.|

#### Example

```tsx
import { useSession } from "./use-auth-hooks"

function MyComponent() {
    const { data: sessionData, session, user, isPending, error } = useSession()

    if (isPending) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return <div>Welcome, {user?.name}</div>
}
```

### useToken

The useToken hook is used to manage the token state.

#### Props

| Prop      | Type                                                                 | Description                                  |
|-----------|----------------------------------------------------------------------|----------------------------------------------|
| options   | UseQueryOptions | Optional query options for the token query.  |

#### Example

```tsx
import { useToken } from "./use-auth-hooks"

function MyComponent() {
    const { token, isPending, error } = useToken()

    if (isPending) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return <div>Your token: {token?.token}</div>
}
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
```