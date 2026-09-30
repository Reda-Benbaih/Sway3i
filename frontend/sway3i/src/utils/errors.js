export function getErrorMessage(error, fallback = 'Something went wrong, please try again.') {
  if (!error?.response) {
    return error?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Check that the backend is running.' : fallback
  }
  const data = error.response.data
  if (data?.validationErrors) return 'Please correct the highlighted fields.'
  return data?.message || fallback
}

export function getFieldErrors(error) {
  return error?.response?.data?.validationErrors || {}
}

export function getStatus(error) {
  return error?.response?.status
}
