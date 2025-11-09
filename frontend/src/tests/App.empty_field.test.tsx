import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// ----- Előkészítés (Mockolás) -----
vi.mock('../../components/Orb', () => ({
  default: vi.fn(() => <div data-testid="orb-mock"></div>),
}));
vi.mock('../HomePage', () => ({
  default: vi.fn(() => <div data-testid="home-page-mock">Kezdőlap</div>),
}));
vi.mock('../api', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

// ----- Teszt Szekció -----
describe('App komponens: Validáció (Üres mező)', () => {

  it('Hibát jelez, ha regisztrációnál üresen marad egy mező', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Átváltás regisztrációra
    const registerLink = screen.getByRole('button', { name: /nincs fiókod\? regisztrálj/i });
    await user.click(registerLink);

    // 2. Kitöltünk mindent, KIVÉVE az emailt
    await user.type(screen.getByPlaceholderText('Anna'), 'Teszt Felhasználó');
    // Email üresen marad
    await user.type(screen.getByPlaceholderText('password1'), 'jelszo123');
    await user.type(screen.getByPlaceholderText('ismételd meg a jelszót'), 'jelszo123');

    // 3. Kattintás a "Regisztráció" gombra
    const submitButton = screen.getByRole('button', { name: 'Regisztráció' });
    await user.click(submitButton);

    // 4. ELLENŐRZÉS: Megjelent a hibaüzenet?
    expect(screen.getByText('Minden mezőt ki kell tölteni.')).toBeInTheDocument();
  });

});