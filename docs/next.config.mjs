import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    output: "export",
    basePath: process.env.NODE_ENV === "production" ? "/better-auth-tanstack" : "",
    images: { unoptimized: true }
}

export default withMDX(config)
