import type { createAuthClient } from "better-auth/react"

export type AuthClient = Omit<ReturnType<typeof createAuthClient>, "signUp">
