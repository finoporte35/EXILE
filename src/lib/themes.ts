
import type { AppTheme } from '@/types';

export const DEFAULT_THEME_ID = 'default-dark-red';

export const APP_THEMES: AppTheme[] = [
  {
    id: 'default-dark-red',
    name: 'Predeterminado (Rojo Oscuro)',
    colors: {
      primary: '0 100% 50%', // Bright Pure Red
      accent: '0 100% 50%',  // Bright Pure Red
      background: '0 0% 0%', // Dark Gray for background
      foreground: '0 0% 98%', // Light Gray for text
      card: '0 0% 3%', // Slightly darker card background
      cardForeground: '0 0% 95%', // Light gray for card text
      sidebarPrimary: '0 100% 50%', // Bright Pure Red for sidebar primary elements
      sidebarAccent: '0 0% 15%', // Darker accent for sidebar hover states
    },
  },
  {
    id: 'cyber-blue',
    name: 'Ciber Azul',
    colors: {
      primary: '217 91% 60%', // Vibrant Blue
      accent: '217 91% 60%',  // Vibrant Blue
      background: '220 13% 5%', // Very Dark Blue-Gray
      foreground: '210 40% 98%', // Light Cyan-Gray
      card: '220 13% 8%', // Slightly darker blue-gray for cards
      cardForeground: '210 40% 95%',
      sidebarPrimary: '217 91% 60%',
      sidebarAccent: '220 13% 15%',
    },
  },
  {
    id: 'emerald-forest',
    name: 'Bosque Esmeralda',
    colors: {
      primary: '145 63% 49%', // Deep Green
      accent: '145 63% 49%',  // Deep Green
      background: '150 10% 8%', // Dark Greenish-Gray
      foreground: '140 25% 95%', // Light Mint
      card: '150 10% 12%', // Darker greenish-gray for cards
      cardForeground: '140 25% 92%',
      sidebarPrimary: '145 63% 49%',
      sidebarAccent: '150 10% 18%',
    },
  },
  {
    id: 'golden-sunrise',
    name: 'Amanecer Dorado',
    colors: {
      primary: '45 100% 51%', // Bright Gold/Yellow
      accent: '45 100% 51%',  // Bright Gold/Yellow
      background: '30 10% 8%', // Warm Dark Brown
      foreground: '35 30% 96%', // Pale Yellow
      card: '30 10% 12%', // Darker warm brown for cards
      cardForeground: '35 30% 93%',
      sidebarPrimary: '45 100% 51%',
      sidebarAccent: '30 10% 18%',
    },
  },
];

export const getThemeById = (themeId: string): AppTheme | undefined => {
  return APP_THEMES.find(theme => theme.id === themeId);
};
