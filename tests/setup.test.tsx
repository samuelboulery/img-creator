import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

// Vérifie le câblage de l'infra : jsdom + React 19 + jest-dom.
test('rend un composant React et applique les matchers jest-dom', () => {
  render(<p>atelier</p>)
  expect(screen.getByText('atelier')).toBeInTheDocument()
})
