import { useId, useState, cloneElement, isValidElement } from 'react'
import Icon from './Icon'

export default function Field({ label, hint, error, optional, children, className = '' }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': describedBy,
      })
    : children

  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field-label" htmlFor={isValidElement(children) ? children.props.id || id : undefined}>
          {label} {optional && <span className="optional">(optional)</span>}
        </label>
      )}
      {control}
      {error ? (
        <span className="field-error" id={`${id}-error`}>
          <Icon name="alert" size={14} />
          {error}
        </span>
      ) : (
        hint && (
          <span className="field-hint" id={`${id}-hint`}>
            {hint}
          </span>
        )
      )}
    </div>
  )
}

export function PasswordInput({ id, className = '', ...rest }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="input-group has-action">
      <span className="input-icon">
        <Icon name="lock" size={18} />
      </span>
      <input id={id} type={visible ? 'text' : 'password'} className={`input ${className}`} {...rest} />
      <button
        type="button"
        className="btn btn-ghost btn-icon btn-sm input-action"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </div>
  )
}

export function IconInput({ icon, id, className = '', ...rest }) {
  return (
    <div className="input-group">
      <span className="input-icon">
        <Icon name={icon} size={18} />
      </span>
      <input id={id} className={`input ${className}`} {...rest} />
    </div>
  )
}
