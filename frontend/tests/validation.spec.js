const { describe, it, expect } = require('vitest')
const V = require('../js/validation-utils')

describe('validation-utils', () => {
  it('requiredFields returns missing fields', () => {
    const form = { querySelectorAll: (sel) => sel === '[required]' ? [ { value: '' , name: 'a' }, { value: 'ok', name: 'b' } ] : [] }
    const errors = V.requiredFields(form)
    expect(Array.isArray(errors)).toBe(true)
    expect(errors.length).toBe(1)
    expect(errors[0].name).toBe('a')
  })

  it('passwordMatch returns null when matching', () => {
    const form = { querySelector: (sel) => sel.includes('confirm') ? { value: '123' } : { value: '123' } }
    expect(V.passwordMatch(form)).toBeNull()
  })

  it('passwordMatch returns error when mismatch', () => {
    const form = { querySelector: (sel) => sel.includes('confirm') ? { value: '999' } : { value: '123' } }
    const err = V.passwordMatch(form)
    expect(err).toEqual(expect.objectContaining({ name: 'confirm_password' }))
  })
})
