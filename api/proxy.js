// Vercel Web Handler. Only this fixed upstream can receive API requests.
async function proxy(request) {
  const incoming = new URL(request.url)
  const path = incoming.searchParams.get("__samurai_path")
  if (!path) return new Response("Missing API path", { status: 400 })
  incoming.searchParams.delete("__samurai_path")

  const upstream = new URL(`https://social-network.samuraijs.com/api/${path}`)
  if (!upstream.pathname.startsWith("/api/")) {
    return new Response("Invalid API path", { status: 400 })
  }
  upstream.search = incoming.searchParams.toString()

  // Do not forward Origin, Referer, cookies or Vercel's internal headers.
  const headers = new Headers()
  for (const name of ["accept", "content-type", "authorization", "api-key"]) {
    const value = request.headers.get(name)
    if (value !== null) headers.set(name, value)
  }

  try {
    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    })
    // Never redirect the browser to the external API (or forward credentials elsewhere).
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel()
      return new Response("Unexpected API redirect", { status: 502, headers: { "Cache-Control": "no-store" } })
    }
    const responseHeaders = new Headers({ "Cache-Control": "no-store" })
    for (const name of ["content-type", "reason", "retry-after", "www-authenticate"]) {
      const value = response.headers.get(name)
      if (value !== null) responseHeaders.set(name, value)
    }
    return new Response(response.body, { status: response.status, headers: responseHeaders })
  } catch {
    return new Response("SamuraiJS API is unavailable", { status: 502, headers: { "Cache-Control": "no-store" } })
  }
}

export { proxy as GET, proxy as HEAD, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS }
