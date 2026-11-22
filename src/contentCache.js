// Caches what a loader reads from content/ for the life of the process (a build reads every file once). In `npm start`
// the plugin in vite.config.js counts every edit in content/ in globalThis.__contentVersion, so the next call reads again.
export function untilContentChanges (load) {
  let value, version
  return () => {
    if (value === undefined || version !== globalThis.__contentVersion) {
      version = globalThis.__contentVersion
      value = load()
    }
    return value
  }
}
