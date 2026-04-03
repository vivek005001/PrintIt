import { useEffect, useRef, useCallback } from 'react'

/**
 * Silently re-calls `fetchFn` every `intervalMs` milliseconds.
 * Also fires immediately on mount.
 * @param {() => Promise<void>} fetchFn - async function that fetches and sets state
 * @param {number} intervalMs - polling interval (default 10 seconds)
 * @param {boolean} enabled - set false to pause polling (e.g. when modal is open)
 */
export function useAutoRefresh(fetchFn, intervalMs = 10000, enabled = true) {
    const savedFn = useRef(fetchFn)

    // Keep the ref fresh without restarting the interval
    useEffect(() => { savedFn.current = fetchFn }, [fetchFn])

    useEffect(() => {
        if (!enabled) return

        // Fire immediately
        savedFn.current()

        const id = setInterval(() => {
            savedFn.current()
        }, intervalMs)

        return () => clearInterval(id)
    }, [intervalMs, enabled])
}
