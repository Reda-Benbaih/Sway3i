export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,100}$/
export const PASSWORD_HINT = 'At least 8 characters, with a letter and a digit.'
export const PHONE_PATTERN = /^$|^\+?[0-9 ]{9,20}$/
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateAccount(form, { requirePassword }) {
  const errors = {}
  if (!form.firstName?.trim()) errors.firstName = 'First name is required'
  else if (form.firstName.length > 50) errors.firstName = 'First name must not exceed 50 characters'
  if (!form.lastName?.trim()) errors.lastName = 'Last name is required'
  else if (form.lastName.length > 50) errors.lastName = 'Last name must not exceed 50 characters'
  if (!form.email?.trim()) errors.email = 'Email is required'
  else if (!EMAIL_PATTERN.test(form.email)) errors.email = 'Email should be valid'
  if (requirePassword || form.password) {
    if (!form.password) errors.password = 'Password is required'
    else if (!PASSWORD_PATTERN.test(form.password)) errors.password = PASSWORD_HINT
    if ('confirmPassword' in form && form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
  }
  if (form.phone && !PHONE_PATTERN.test(form.phone)) errors.phone = 'Phone number is not valid'
  return errors
}

export function clean(payload) {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value]))
}
