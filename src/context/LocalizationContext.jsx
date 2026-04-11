import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [locale, setLocale] = useState('es');
  const [currency, setCurrency] = useState('EUR');
  const [units, setUnits] = useState('kg');
  const [autoDetect, setAutoDetect] = useState(true);

  useEffect(() => {
    if (autoDetect) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Auto-detection logic based on timezone
      if (tz.includes('Europe/Madrid')) {
        setLocale('es');
        setCurrency('EUR');
        setUnits('kg');
      } else if (tz.includes('Australia/')) {
        setLocale('en');
        setCurrency('AUD');
        setUnits('kg');
      } else if (tz.includes('America/')) {
        setLocale('en');
        setCurrency('USD');
        setUnits('lbs');
      } else if (tz.includes('Europe/London')) {
        setLocale('en');
        setCurrency('GBP');
        setUnits('kg');
      } else {
        // Default to Global Premium (English/USD)
        setLocale('en');
        setCurrency('USD');
      }
    }
  }, [autoDetect]);

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[locale];
    for (const key of keys) {
      if (result[key]) result = result[key];
      else return path; // Return path as fallback
    }
    return result;
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
