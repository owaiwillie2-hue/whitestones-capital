import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'de' | 'es' | 'fr' | 'it' | 'pt';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    'nav.home': 'Home',
    'nav.investments': 'Investments',
    'nav.crypto': 'Cryptocurrencies',
    'nav.realestate': 'Real Estate',
    'nav.oilgas': 'Oil and Gas',
    'nav.nft': 'NFT',
    'nav.retirement': 'Retirement',
    'nav.loan': 'Loan',
    'nav.company': 'Company',
    'hero.title': 'Smarter investors are here. You should be here, too.',
    'hero.subtitle': 'Our professionals and industry-leading tools are united to do one thing: make you a smarter, more profitable investor.',
    'cta.openAccount': 'Open a Free Account',
    'cta.login': 'Login',
    'auth.signup': 'Create an Account',
    'auth.login': 'Login into Account',
    'auth.fullName': 'Full Name',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.phone': 'Phone Number',
    'auth.dob': 'Date of Birth',
    'auth.country': 'Country',
    'auth.terms': 'I agree to the Terms & Conditions',
    'auth.haveAccount': 'Already have an account?',
    'auth.noAccount': 'New on our platform?',
    'auth.signInInstead': 'Sign in instead',
    'auth.createAccount': 'Create an account',
    'auth.rememberMe': 'Remember Me',
    'auth.forgotCode': 'Forgot Code?',
    'footer.contact': 'Contact Us',
    'footer.quickLinks': 'Quick Links',
    'footer.company': 'Company',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.investments': 'Investitionen',
    'nav.crypto': 'Kryptowährungen',
    'nav.realestate': 'Immobilien',
    'nav.oilgas': 'Öl und Gas',
    'nav.nft': 'NFT',
    'nav.retirement': 'Altersvorsorge',
    'nav.loan': 'Darlehen',
    'nav.company': 'Unternehmen',
    'hero.title': 'Klügere Investoren sind hier. Sie sollten auch hier sein.',
    'hero.subtitle': 'Unsere Fachleute und branchenführenden Tools vereinen sich für ein Ziel: Sie zu einem klügeren, profitableren Investor zu machen.',
    'cta.openAccount': 'Kostenloses Konto eröffnen',
    'cta.login': 'Anmelden',
    'auth.signup': 'Konto erstellen',
    'auth.login': 'In Konto einloggen',
    'auth.fullName': 'Vollständiger Name',
    'auth.email': 'E-Mail-Adresse',
    'auth.password': 'Passwort',
    'auth.phone': 'Telefonnummer',
    'auth.dob': 'Geburtsdatum',
    'auth.country': 'Land',
    'auth.terms': 'Ich stimme den Allgemeinen Geschäftsbedingungen zu',
    'auth.haveAccount': 'Haben Sie bereits ein Konto?',
    'auth.noAccount': 'Neu auf unserer Plattform?',
    'auth.signInInstead': 'Stattdessen anmelden',
    'auth.createAccount': 'Konto erstellen',
    'auth.rememberMe': 'Angemeldet bleiben',
    'auth.forgotCode': 'Code vergessen?',
    'footer.contact': 'Kontaktiere uns',
    'footer.quickLinks': 'Schnelle Links',
    'footer.company': 'Unternehmen',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.investments': 'Inversiones',
    'nav.crypto': 'Criptomonedas',
    'nav.realestate': 'Bienes Raíces',
    'nav.oilgas': 'Petróleo y Gas',
    'nav.nft': 'NFT',
    'nav.retirement': 'Jubilación',
    'nav.loan': 'Préstamo',
    'nav.company': 'Empresa',
    'hero.title': 'Los inversores más inteligentes están aquí. Tú también deberías estar aquí.',
    'hero.subtitle': 'Nuestros profesionales y herramientas líderes en la industria se unen para hacer una cosa: convertirte en un inversor más inteligente y rentable.',
    'cta.openAccount': 'Abrir una Cuenta Gratuita',
    'cta.login': 'Iniciar Sesión',
    'auth.signup': 'Crear una Cuenta',
    'auth.login': 'Iniciar Sesión en la Cuenta',
    'auth.fullName': 'Nombre Completo',
    'auth.email': 'Dirección de Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.phone': 'Número de Teléfono',
    'auth.dob': 'Fecha de Nacimiento',
    'auth.country': 'País',
    'auth.terms': 'Acepto los Términos y Condiciones',
    'auth.haveAccount': '¿Ya tienes una cuenta?',
    'auth.noAccount': '¿Nuevo en nuestra plataforma?',
    'auth.signInInstead': 'Inicia sesión en su lugar',
    'auth.createAccount': 'Crear una cuenta',
    'auth.rememberMe': 'Recuérdame',
    'auth.forgotCode': '¿Olvidaste el código?',
    'footer.contact': 'Contáctenos',
    'footer.quickLinks': 'Enlaces Rápidos',
    'footer.company': 'Empresa',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.investments': 'Investissements',
    'nav.crypto': 'Cryptomonnaies',
    'nav.realestate': 'Immobilier',
    'nav.oilgas': 'Pétrole et Gaz',
    'nav.nft': 'NFT',
    'nav.retirement': 'Retraite',
    'nav.loan': 'Prêt',
    'nav.company': 'Entreprise',
    'hero.title': 'Les investisseurs plus intelligents sont ici. Vous devriez être ici aussi.',
    'hero.subtitle': 'Nos professionnels et nos outils de pointe sont unis pour faire une chose: faire de vous un investisseur plus intelligent et plus rentable.',
    'cta.openAccount': 'Ouvrir un Compte Gratuit',
    'cta.login': 'Se Connecter',
    'auth.signup': 'Créer un Compte',
    'auth.login': 'Se Connecter au Compte',
    'auth.fullName': 'Nom Complet',
    'auth.email': 'Adresse E-mail',
    'auth.password': 'Mot de Passe',
    'auth.phone': 'Numéro de Téléphone',
    'auth.dob': 'Date de Naissance',
    'auth.country': 'Pays',
    'auth.terms': "J'accepte les Termes et Conditions",
    'auth.haveAccount': 'Vous avez déjà un compte?',
    'auth.noAccount': 'Nouveau sur notre plateforme?',
    'auth.signInInstead': 'Se connecter à la place',
    'auth.createAccount': 'Créer un compte',
    'auth.rememberMe': 'Se souvenir de moi',
    'auth.forgotCode': 'Code oublié?',
    'footer.contact': 'Nous Contacter',
    'footer.quickLinks': 'Liens Rapides',
    'footer.company': 'Entreprise',
  },
  it: {
    'nav.home': 'Home',
    'nav.investments': 'Investimenti',
    'nav.crypto': 'Criptovalute',
    'nav.realestate': 'Immobiliare',
    'nav.oilgas': 'Petrolio e Gas',
    'nav.nft': 'NFT',
    'nav.retirement': 'Pensione',
    'nav.loan': 'Prestito',
    'nav.company': 'Azienda',
    'hero.title': 'Gli investitori più intelligenti sono qui. Dovresti essere qui anche tu.',
    'hero.subtitle': 'I nostri professionisti e gli strumenti leader del settore sono uniti per fare una cosa: renderti un investitore più intelligente e redditizio.',
    'cta.openAccount': 'Apri un Conto Gratuito',
    'cta.login': 'Accedi',
    'auth.signup': 'Crea un Account',
    'auth.login': 'Accedi all\'Account',
    'auth.fullName': 'Nome Completo',
    'auth.email': 'Indirizzo Email',
    'auth.password': 'Password',
    'auth.phone': 'Numero di Telefono',
    'auth.dob': 'Data di Nascita',
    'auth.country': 'Paese',
    'auth.terms': 'Accetto i Termini e le Condizioni',
    'auth.haveAccount': 'Hai già un account?',
    'auth.noAccount': 'Nuovo sulla nostra piattaforma?',
    'auth.signInInstead': 'Accedi invece',
    'auth.createAccount': 'Crea un account',
    'auth.rememberMe': 'Ricordami',
    'auth.forgotCode': 'Codice dimenticato?',
    'footer.contact': 'Contattaci',
    'footer.quickLinks': 'Collegamenti Rapidi',
    'footer.company': 'Azienda',
  },
  pt: {
    'nav.home': 'Início',
    'nav.investments': 'Investimentos',
    'nav.crypto': 'Criptomoedas',
    'nav.realestate': 'Imóveis',
    'nav.oilgas': 'Petróleo e Gás',
    'nav.nft': 'NFT',
    'nav.retirement': 'Aposentadoria',
    'nav.loan': 'Empréstimo',
    'nav.company': 'Empresa',
    'hero.title': 'Investidores mais inteligentes estão aqui. Você também deveria estar aqui.',
    'hero.subtitle': 'Nossos profissionais e ferramentas líderes do setor estão unidos para fazer uma coisa: torná-lo um investidor mais inteligente e lucrativo.',
    'cta.openAccount': 'Abrir uma Conta Gratuita',
    'cta.login': 'Entrar',
    'auth.signup': 'Criar uma Conta',
    'auth.login': 'Entrar na Conta',
    'auth.fullName': 'Nome Completo',
    'auth.email': 'Endereço de E-mail',
    'auth.password': 'Senha',
    'auth.phone': 'Número de Telefone',
    'auth.dob': 'Data de Nascimento',
    'auth.country': 'País',
    'auth.terms': 'Eu concordo com os Termos e Condições',
    'auth.haveAccount': 'Já tem uma conta?',
    'auth.noAccount': 'Novo em nossa plataforma?',
    'auth.signInInstead': 'Entrar em vez disso',
    'auth.createAccount': 'Criar uma conta',
    'auth.rememberMe': 'Lembrar de mim',
    'auth.forgotCode': 'Esqueceu o código?',
    'footer.contact': 'Entre em Contato',
    'footer.quickLinks': 'Links Rápidos',
    'footer.company': 'Empresa',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage?.getItem('language');
      return (saved as Language) || 'en';
    } catch (error) {
      console.error('Error reading language from localStorage:', error);
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage?.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
