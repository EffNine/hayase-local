export const AUTH_CHANNEL = 'hayase-lite-auth'

export function authCallbackSearch (value: string) {
  const url = new URL(value || '/', 'hayase-lite://authorize/')
  const params = new URLSearchParams(url.search)
  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
  const hashParams = new URLSearchParams(hash)

  for (const [key, val] of hashParams) {
    if (!params.has(key)) params.set(key, val)
  }

  const search = params.toString()
  return search ? `?${search}` : ''
}

export function authCallbackValueFromLocation () {
  if (location.hash.startsWith('#/authorize')) return location.hash.slice('#/authorize'.length)

  return `${location.search}${location.hash}`
}

export function broadcastAuthCallback (value: string) {
  const search = authCallbackSearch(value)
  if (!search) return

  const channel = new BroadcastChannel(AUTH_CHANNEL)
  channel.postMessage(search)
  channel.close()
}
