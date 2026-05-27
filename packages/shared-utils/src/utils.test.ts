import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  formatDateShort,
  getNights,
  isDateInRange,
  formatCurrency,
  slugify,
  truncate,
  capitalize,
  buildUrl,
  groupBy,
  uniqueBy,
  isValidEmail,
  isValidPhone,
} from './index'

describe('shared-utils', () => {
  describe('cn (Tailwind class merging)', () => {
    it('should merge classes correctly', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
      expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6')
      expect(cn('btn', undefined, 'text-white')).toBe('btn text-white')
    })
  })

  describe('Date utilities', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-03-15')
      expect(formatDate(date, 'en-US')).toBe('March 15, 2024')
      expect(formatDateShort(date, 'en-US')).toBe('Mar 15')
    })

    it('should calculate nights correctly', () => {
      const checkIn = new Date('2024-03-15')
      const checkOut = new Date('2024-03-18')
      expect(getNights(checkIn, checkOut)).toBe(3)
    })

    it('should check date ranges correctly', () => {
      const date = new Date('2024-03-16')
      const start = new Date('2024-03-15')
      const end = new Date('2024-03-17')
      expect(isDateInRange(date, start, end)).toBe(true)
      
      const outsideDate = new Date('2024-03-18')
      expect(isDateInRange(outsideDate, start, end)).toBe(false)
    })
  })

  describe('Currency utilities', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56, 'EUR', 'en-US')).toBe('€1,234.56')
      expect(formatCurrency(1000, 'USD', 'en-US')).toBe('$1,000')
    })
  })

  describe('String utilities', () => {
    it('should slugify strings correctly', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces')
      expect(slugify('Special@#$Characters%')).toBe('specialcharacters')
    })

    it('should truncate strings correctly', () => {
      expect(truncate('Hello World', 5)).toBe('Hello…')
      expect(truncate('Short', 10)).toBe('Short')
      expect(truncate('Exactly ten', 11)).toBe('Exactly ten')
    })

    it('should capitalize strings correctly', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('HELLO')
      expect(capitalize('')).toBe('')
    })
  })

  describe('URL utilities', () => {
    it('should build URLs with parameters', () => {
      const url = buildUrl('/search', { q: 'malta', page: 1, active: true })
      expect(url).toContain('q=malta')
      expect(url).toContain('page=1')
      expect(url).toContain('active=true')
    })

    it('should handle undefined parameters', () => {
      const url = buildUrl('/search', { q: 'malta', page: undefined })
      expect(url).toContain('q=malta')
      expect(url).not.toContain('page=')
    })
  })

  describe('Array utilities', () => {
    const testData = [
      { category: 'luxury', name: 'Villa A' },
      { category: 'budget', name: 'Apartment B' },
      { category: 'luxury', name: 'Villa C' },
    ]

    it('should group arrays by key', () => {
      const grouped = groupBy(testData, 'category')
      expect(grouped.luxury).toHaveLength(2)
      expect(grouped.budget).toHaveLength(1)
    })

    it('should filter unique items by key', () => {
      const duplicated = [...testData, { category: 'luxury', name: 'Villa D' }]
      const unique = uniqueBy(duplicated, 'category')
      expect(unique).toHaveLength(2)
      expect(unique.map(item => item.category)).toEqual(['luxury', 'budget'])
    })
  })

  describe('Validation utilities', () => {
    it('should validate emails correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('valid.email+tag@domain.co.uk')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })

    it('should validate phone numbers correctly', () => {
      expect(isValidPhone('+356 1234 5678')).toBe(true)
      expect(isValidPhone('1234567890')).toBe(true)
      expect(isValidPhone('+1-234-567-8900')).toBe(true)
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('invalid-phone')).toBe(false)
    })
  })
})