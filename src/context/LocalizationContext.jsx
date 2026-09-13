import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [locale, setLocale] = useState('es');
  const [currency, setCurrency] = useState('EUR');
  const [units, setUnits] = useState('kg');
  const [autoDetect, setAutoDetect] = useState(true);

  useEffect(() => {
    if (!autoDetect) return;

    // Primary: navigator.language (most reliable)
    const lang = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase();
    const tz   = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (lang.startsWith('es')) {
      // Any Spanish locale → Spanish UI, EUR by default
      setLocale('es');
      setCurrency(tz.includes('America/') ? 'USD' : 'EUR');
      setUnits('kg');
    } else if (tz.includes('Australia/')) {
      setLocale('en'); setCurrency('AUD'); setUnits('kg');
    } else if (lang.startsWith('en-gb') || tz.includes('Europe/London')) {
      setLocale('en'); setCurrency('GBP'); setUnits('kg');
    } else if (tz.includes('America/')) {
      setLocale('en'); setCurrency('USD'); setUnits('lbs');
    } else {
      setLocale('en'); setCurrency('USD'); setUnits('kg');
    }
  }, [autoDetect]);

  const buscar = (idioma, path) => {
    let nodo = translations[idioma];
    for (const key of path.split('.')) {
      if (nodo == null || typeof nodo !== 'object' || !(key in nodo)) return undefined;
      nodo = nodo[key];
    }
    return typeof nodo === 'string' ? nodo : undefined;
  };

  const t = (path, vars) => {
    const otro = locale === 'es' ? 'en' : 'es';
    const texto = buscar(locale, path) ?? buscar(otro, path);
    if (texto == null) {
      if (import.meta.env?.DEV) console.warn('[AURA] falta la traducción:', path);
      return path;
    }
    if (!vars) return texto;
    return texto.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  };

  const setManualConfig = (newLocale, newCurrency, newUnits) => {
    setAutoDetect(false);
    if (newLocale) setLocale(newLocale);
    if (newCurrency) setCurrency(newCurrency);
    if (newUnits) setUnits(newUnits);
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AUD':
      case 'USD': return '$';
      default: return '$';
    }
  };

  return (
    <LocalizationContext.Provider value={{ 
      locale, currency, units, t, 
      setManualConfig, getCurrencySymbol, setLocale 
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error('useTranslation must be used within a LocalizationProvider');
  return context;
};
