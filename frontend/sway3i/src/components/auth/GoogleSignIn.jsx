import { useEffect, useRef, useState } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

let scriptPromise = null

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = () => {
        scriptPromise = null
        reject(new Error('Google sign-in could not be loaded'))
      }
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

export default function GoogleSignIn({ onCredential, text = 'continue_with', disabled }) {
  const containerRef = useRef(null)
  const callbackRef = useRef(onCredential)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    callbackRef.current = onCredential
  })

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false
    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => callbackRef.current(response.credential),
          ux_mode: 'popup',
        })
        containerRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text,
          width: Math.min(containerRef.current.offsetWidth || 400, 400),
        })
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [text])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="divider">or</div>
      {failed ? (
        <p className="field-hint" style={{ textAlign: 'center' }}>
          Google sign-in is unavailable right now.
        </p>
      ) : (
        <div
          className="google-slot"
          ref={containerRef}
          style={disabled ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
          aria-label="Continue with Google"
        />
      )}
    </div>
  )
}
