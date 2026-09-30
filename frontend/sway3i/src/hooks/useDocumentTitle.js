import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Sway3i` : 'Sway3i · Find the right teacher'
  }, [title])
}
