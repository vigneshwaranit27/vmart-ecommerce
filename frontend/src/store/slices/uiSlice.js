import { createSlice } from '@reduxjs/toolkit';

const theme = localStorage.getItem('vmartTheme') || 'light';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme,
    isMobileMenuOpen: false,
    isCartOpen: false,
    isSearchOpen: false,
    isAuthModalOpen: false,
    authModalView: 'login', // 'login' | 'register'
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('vmartTheme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    setTheme: (state, { payload }) => {
      state.theme = payload;
      localStorage.setItem('vmartTheme', payload);
    },
    toggleMobileMenu: (state) => { state.isMobileMenuOpen = !state.isMobileMenuOpen; },
    closeMobileMenu: (state) => { state.isMobileMenuOpen = false; },
    toggleCart: (state) => { state.isCartOpen = !state.isCartOpen; },
    closeCart: (state) => { state.isCartOpen = false; },
    toggleSearch: (state) => { state.isSearchOpen = !state.isSearchOpen; },
    openAuthModal: (state, { payload }) => {
      state.isAuthModalOpen = true;
      state.authModalView = payload || 'login';
    },
    closeAuthModal: (state) => { state.isAuthModalOpen = false; },
    setAuthModalView: (state, { payload }) => { state.authModalView = payload; }
  }
});

export const {
  toggleTheme, setTheme,
  toggleMobileMenu, closeMobileMenu,
  toggleCart, closeCart,
  toggleSearch, openAuthModal, closeAuthModal, setAuthModalView
} = uiSlice.actions;

export default uiSlice.reducer;
