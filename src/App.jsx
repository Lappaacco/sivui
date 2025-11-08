import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Navigaatiolinkin komponentti. Vastaanottaa tekstin, kohteen ankkurin,
 * aktiivisuuden sekä valinnaisen onClick-tapahtumakäsittelijän.
 */
function NavItem({ label, href, active, onClick }) {
  const baseClasses =
    'block px-4 py-2 mt-2 rounded-lg transition-colors font-semibold font-heading';
  const activeClasses = 'bg-primary text-white shadow';
  const inactiveClasses = 'text-primary hover:bg-primaryLight hover:text-white';
  const className = `${baseClasses} ${active ? activeClasses : inactiveClasses}`;
  return (
    <a href={href} className={className} onClick={onClick}>
      {label}
    </a>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [velloLoading, setVelloLoading] = useState(true);
  const [velloFailed, setVelloFailed] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const mobileMenuRef = useRef(null);
  const velloRef = useRef(null);

  // Update SEO meta tags when language changes
  useEffect(() => {
    // Update document title
    document.title = t('meta.title');
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('meta.description'));
    }
    
    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t('meta.title'));
    }
    
    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', t('meta.description'));
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = i18n.language;
  }, [i18n.language, t]);

  const currentYear = new Date().getFullYear();

  // Kielenvaihtofunktio
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    document.documentElement.lang = lng;
  };

  // Päivitä aktiivinen osa vierityksen perusteella.
  // Käytetään requestAnimationFrame throttlingia ja rekisteröidään kuuntelija vain kerran.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section'));
    let ticking = false;

    function updateActive() {
      let current = 'home';
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          current = sec.getAttribute('id') || current;
          break;
        }
      }
      setActiveSection((prev) => (prev === current ? prev : current));
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateActive);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Aseta heti, jos sivu aukeaa scrollatun sijainnin kanssa
    updateActive();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Sulje mobiilivalikko, kun navigaatioelementti valitaan
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  // Focus mobile menu without scrolling when it opens
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        window.scrollTo(0, 0);
      }
      setTimeout(() => {
        const firstLink = mobileMenuRef.current.querySelector('a, button');
        if (firstLink) firstLink.focus();
      }, 250);
    }
  }, [mobileMenuOpen]);

    // Inject Vello embed script - yksinkertaistettu versio ilman manuaalista layoutia
  useEffect(() => {
    const root = velloRef.current;
    if (!root) return;

    // Määritä Vellon kieli nykyisen i18n-kielen mukaan
    const velloLang = i18n.language === 'sv' ? 'sv' : i18n.language === 'en' ? 'en' : 'fi';

    // Poista vanha skripti ja iframe kokonaan kun kieli vaihtuu
    const existingScript = document.querySelector('script[src="https://static.vello.fi/embed/v1.js"][data-url="ilojaloin-jalkaterapia"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Tyhjennä root-elementti
    root.innerHTML = '';
    
    // Lisää uusi skripti oikealla kielellä
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://static.vello.fi/embed/v1.js';
    s.setAttribute('data-url', 'ilojaloin-jalkaterapia');
    s.setAttribute('data-lang', velloLang);
    root.appendChild(s);

    // Tarkkaile milloin iframe ilmestyy
    const observer = new MutationObserver(() => {
      const iframe = root.querySelector('iframe');
      if (iframe) {
        setVelloLoading(false);
        observer.disconnect();
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    // Fallback: jos iframe ei lataa 10 sekunnissa, näytä suora linkki
    const fallbackTimer = setTimeout(() => {
      if (!root.querySelector('iframe')) {
        setVelloLoading(false);
        setVelloFailed(true);
      }
    }, 10000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [i18n.language]); // Päivitä kun kieli vaihtuu

  return (
    <>
      {/* Mobiiliotsikko */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <a href="#home" className="flex items-center gap-3">
          <img src="/ilojaloin.svg" alt="Ilojaloin - logo" className="w-10 h-10" />
          <div>
            <div className="text-xl font-heading text-primary">ILOJALOIN</div>
            <div className="text-xs italic text-gray-500 font-heading">Jalkaterapiapalvelut</div>
          </div>
        </a>
        <div className="flex items-center gap-2">
          {/* Kielivalitsin */}
          <div className="flex gap-1 text-xs">
            <button onClick={() => changeLanguage('fi')} className={`px-2 py-1 rounded ${i18n.language === 'fi' ? 'bg-primary text-white' : 'text-primary hover:bg-primaryLight'}`}>FI</button>
            <button onClick={() => changeLanguage('sv')} className={`px-2 py-1 rounded ${i18n.language === 'sv' ? 'bg-primary text-white' : 'text-primary hover:bg-primaryLight'}`}>SV</button>
            <button onClick={() => changeLanguage('en')} className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-primary text-white' : 'text-primary hover:bg-primaryLight'}`}>EN</button>
          </div>
          <button
            type="button"
            aria-label="Valikko"
            aria-expanded={mobileMenuOpen}
            className="text-primary focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        </div>
      </header>
      {/* Mobiilivalikon lista */}
      {mobileMenuOpen && (
        <nav ref={mobileMenuRef} tabIndex={-1} className="md:hidden bg-white border-b border-gray-200 px-4 py-2 space-y-1 shadow-sm">
          <NavItem label={t('nav.home')} href="#home" active={activeSection === 'home'} onClick={handleNavClick} />
          <NavItem label={t('nav.about')} href="#about" active={activeSection === 'about'} onClick={handleNavClick} />
          <NavItem label={t('nav.footTherapy')} href="#jalkaterapia" active={activeSection === 'jalkaterapia'} onClick={handleNavClick} />
          <NavItem label={t('nav.services')} href="#palveluni" active={activeSection === 'palveluni'} onClick={handleNavClick} />
          <NavItem label={t('nav.hygiene')} href="#hygienia" active={activeSection === 'hygienia'} onClick={handleNavClick} />
          <NavItem label={t('nav.pricing')} href="#hinnoittelusta" active={activeSection === 'hinnoittelusta'} onClick={handleNavClick} />
          <NavItem label={t('nav.contact')} href="#contact" active={activeSection === 'contact'} onClick={handleNavClick} />
          <NavItem label={t('nav.booking')} href="#booking" active={activeSection === 'booking'} onClick={handleNavClick} />
        </nav>
      )}
      <div className="flex min-h-screen">
  {/* Sivupalkki tablet- ja desktop-koissa */}
  <nav className="hidden md:block w-56 bg-white border-r border-gray-200 shadow-md sticky top-0 h-screen flex-shrink-0 overflow-y-auto">
          <a href="#home" className="p-6 flex items-center gap-3 block">
            <img src="/ilojaloin.svg" alt="Ilojaloin - logo" className="w-12 h-12" />
            <div>
              <div className="text-2xl font-heading text-primary mb-1">ILOJALOIN</div>
              <div className="text-sm italic text-gray-500 font-heading">Jalkaterapiapalvelut</div>
            </div>
          </a>
          <div className="px-4">
            <NavItem label={t('nav.home')} href="#home" active={activeSection === 'home'} onClick={handleNavClick} />
            <NavItem label={t('nav.about')} href="#about" active={activeSection === 'about'} onClick={handleNavClick} />
            <NavItem label={t('nav.footTherapy')} href="#jalkaterapia" active={activeSection === 'jalkaterapia'} onClick={handleNavClick} />
            <NavItem label={t('nav.services')} href="#palveluni" active={activeSection === 'palveluni'} onClick={handleNavClick} />
            <NavItem label={t('nav.hygiene')} href="#hygienia" active={activeSection === 'hygienia'} onClick={handleNavClick} />
            <NavItem label={t('nav.pricing')} href="#hinnoittelusta" active={activeSection === 'hinnoittelusta'} onClick={handleNavClick} />
            <NavItem label={t('nav.contact')} href="#contact" active={activeSection === 'contact'} onClick={handleNavClick} />
            <NavItem label={t('nav.booking')} href="#booking" active={activeSection === 'booking'} onClick={handleNavClick} />
          </div>
          {/* Kielivalitsin desktop */}
            <div className="px-4 mt-4 pb-4 border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-500 mb-2 font-heading">Kieli / Språk / Language</div>
              <div className="flex flex-col gap-1">
              <button onClick={() => changeLanguage('fi')} className={`px-3 py-2 rounded text-sm font-semibold transition text-left ${i18n.language === 'fi' ? 'bg-primary text-white' : 'text-primary hover:bg-primaryLight hover:text-white'}`}>Suomi</button>
              <button onClick={() => changeLanguage('sv')} className={`px-3 py-2 rounded text-sm font-semibold transition text-left ${i18n.language === 'sv' ? 'bg-primary text-white' : 'text-primary hover:bg-primaryLight hover:text-white'}`}>Svenska</button>
              <button onClick={() => changeLanguage('en')} className={`px-3 py-2 rounded text-sm font-semibold transition text-left ${i18n.language === 'en' ? 'bg-primary text-white' : 'text-primary hover:bg-primaryLight hover:text-white'}`}>English</button>
            </div>
          </div>
        </nav>
        {/* Pääsisältö */}
        <main className="flex-1 overflow-x-hidden">
          {/* Hero-osio (täysleveä tausta, sisällä keskitetty sisältö max-w-6xl) */}
          <section id="home" className="relative min-h-screen flex items-center justify-center bg-primaryLight text-white">
            <div className="text-center px-4 max-w-screen-xl lg:max-w-screen-2xl mx-auto">
              <img src="/Ilojaloinvalk.svg" alt="Ilojaloin - logo" width="320" height="320" fetchpriority="high" className="mx-auto mb-6 w-40 sm:w-48 md:w-56 lg:w-64 xl:w-80 max-w-full h-auto" />
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading mb-4">{t('hero.title')}</h1>
              <p className="text-md md:text-lg lg:text-xl max-w-2xl mx-auto">
                {t('hero.subtitle')}
              </p>
              <div className="mt-8 flex justify-center">
                <a
                  href={`https://vello.fi/ilojaloin-jalkaterapia?locale=${i18n.language === 'sv' ? 'sv' : i18n.language === 'en' ? 'en' : 'fi'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-primary font-semibold rounded-md shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  {t('hero.bookButton')}
                </a>
              </div>
            </div>
          </section>

          {/* About section */}
          <section id="about" className="py-12 md:py-20 px-4 bg-white">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">{t('about.title')}</h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="rounded-lg overflow-hidden">
                  <img src="/yrittaja.png" alt="Jalkaterapeutti Satu Paunonen" className="w-full h-full object-cover" />
                </div>
                <div className="prose max-w-full">
                  <p dangerouslySetInnerHTML={{ __html: t('about.paragraph1') }}></p>

                  <div className="my-4" aria-hidden></div>

                  <p dangerouslySetInnerHTML={{ __html: t('about.paragraph2') }}></p>

                  <div className="my-4" aria-hidden></div>

                  <p dangerouslySetInnerHTML={{ __html: t('about.paragraph3') }}></p>

                  <div className="my-4" aria-hidden></div>

                  <p dangerouslySetInnerHTML={{ __html: t('about.paragraph4') }}></p>
                </div>
              </div>
            </div>
          </section>

          {/* Jalkaterapia section */}
          <section id="jalkaterapia" className="py-12 md:py-20 px-4 bg-offwhite">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">{t('footTherapy.title')}</h2>
              <div className="prose max-w-full">
                <p dangerouslySetInnerHTML={{ __html: t('footTherapy.paragraph1') }}></p>
                <div className="my-4" aria-hidden></div>
                <p dangerouslySetInnerHTML={{ __html: t('footTherapy.paragraph2') }}></p>
              </div>
            </div>
          </section>

          {/* Palveluni section */}
          <section id="palveluni" className="py-12 md:py-20 px-4 bg-white">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">{t('services.title')}</h2>
              <div className="prose max-w-full">
                <p dangerouslySetInnerHTML={{ __html: t('services.intro') }}></p>
                <div className="my-4" aria-hidden></div>
                
                <ul className="list-none space-y-2">
                  {t('services.items', { returnObjects: true }).map((item, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }}></li>
                  ))}
                </ul>

                <div className="my-4" aria-hidden></div>
                <p>{t('services.outro')}</p>
              </div>
            </div>
          </section>

          {/* Turvallisuus ja hygienia section */}
          <section id="hygienia" className="py-12 md:py-20 px-4 bg-offwhite">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">{t('hygiene.title')}</h2>
              <div className="prose max-w-full">
                <p>{t('hygiene.paragraph1')}</p>
                <div className="my-4" aria-hidden></div>
                <p>{t('hygiene.paragraph2')}</p>
                <div className="my-4" aria-hidden></div>
                <p>{t('hygiene.paragraph3')}</p>
                <div className="my-4" aria-hidden></div>
                <p>{t('hygiene.paragraph4')}</p>
                <div className="my-4" aria-hidden></div>
                <p>{t('hygiene.paragraph5')}</p>
                <p dangerouslySetInnerHTML={{ __html: t('hygiene.paragraph6') }}></p>
                <div className="my-4" aria-hidden></div>
                <p dangerouslySetInnerHTML={{ __html: t('hygiene.paragraph7') }}></p>
              </div>
            </div>
          </section>

          {/* Hinnoittelusta section */}
                    <section id="hinnoittelusta" className="py-12 md:py-20 px-4 bg-white">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">{t('pricing.title')}</h2>
              <div className="prose max-w-full mb-8">
                <p>{t('pricing.intro')}</p>
                <div className="mt-6">
                  <p className="mb-3">{t('pricing.benefitsText')}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <img 
                      src="/epassi-logo.svg" 
                      alt="E-passi" 
                      className="h-10 object-contain"
                    />
                    <img 
                      src="/edenred-logo.svg" 
                      alt="Edenred" 
                      className="h-10 object-contain"
                    />
                    <img 
                      src="/smartum-logo.svg" 
                      alt="Smartum" 
                      className="h-10 object-contain"
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-heading text-primary mb-4">{t('pricing.priceListTitle')}</h3>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <table className="w-full table-auto border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-primaryLight text-left">
                      <th className="px-4 py-3 font-medium border border-gray-300">{t('pricing.table.service')}</th>
                      <th className="px-4 py-3 font-medium border border-gray-300">{t('pricing.table.price')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>{t('pricing.shopping.title')}</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          {t('pricing.shopping.items', { returnObjects: true }).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 whitespace-nowrap">{t('pricing.shopping.price')}</td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>{t('pricing.therapy30.title')}</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          {t('pricing.therapy30.items', { returnObjects: true }).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 whitespace-nowrap">{t('pricing.therapy30.price')}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>{t('pricing.therapy45.title')}</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          {t('pricing.therapy45.items', { returnObjects: true }).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 whitespace-nowrap">{t('pricing.therapy45.price')}</td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>{t('pricing.therapy60.title')}</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          {t('pricing.therapy60.items', { returnObjects: true }).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 whitespace-nowrap">{t('pricing.therapy60.price')}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>{t('pricing.therapy75.title')}</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          {t('pricing.therapy75.items', { returnObjects: true }).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 whitespace-nowrap">{t('pricing.therapy75.price')}</td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300"><strong>{t('pricing.children.title')}</strong></td>
                      <td className="px-4 py-3 border border-gray-300 whitespace-nowrap">{t('pricing.children.price')}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>{t('pricing.lectures.title')}</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>{t('pricing.lectures.description')}</li>
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 p-6 bg-offwhite rounded-lg">
                <p className="text-lg">
                  <strong>{t('pricing.note.title')}</strong> {t('pricing.note.description')}
                </p>
                <p className="mt-2 text-lg">
                  {t('pricing.note.phone')}{' '}
                  <a href="tel:+358440684567" className="text-primary hover:underline font-semibold">
                    044 068 4567
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Yhteystieto-osio */}
          <section id="contact" className="py-12 md:py-20 px-4 bg-offwhite">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">{t('contact.title')}</h2>
                  <p className="mb-2">
                    <strong>{t('contact.details.address')}:</strong>{' '}
                    <span className="text-gray-600">Pitkänlahdenkatu 13, {t('contact.details.city')}</span>
                  </p>
                  <p className="mb-2">
                    <strong>{t('contact.details.phone')}:</strong>{' '}
                    <a href="tel:+358440684567" className="text-primary hover:underline">
                      +358 44 068 4567
                    </a>
                  </p>
                  <p className="mb-2">
                    <strong>{t('contact.details.email')}:</strong>{' '}
                    <a href="mailto:ilojaloin@ilojaloin.fi" className="text-primary hover:underline">
                      ilojaloin@ilojaloin.fi
                    </a>
                  </p>
                  <p className="mb-4">
                    <strong>{t('contact.details.businessId')}:</strong> 3288544-8
                  </p>
                  <div className="mb-4 flex items-center gap-4">
                    <a
                      href="https://www.facebook.com/share/19H6mCR7Cg/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-12 h-12 bg-[#1877F2] text-white rounded-full hover:opacity-90 transition-opacity"
                      aria-label="Facebook"
                    >
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/ilojaloin?igsh=MWdqMnB3bDg5MW90eA=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full hover:opacity-90 transition-opacity"
                      style={{background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)'}}
                      aria-label="Instagram"
                    >
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                      </svg>
                    </a>
                  </div>
                  <p>
                    {t('contact.intro')}
                  </p>
                  <div className="my-6">
                    <h3 className="text-xl font-heading text-primary mb-3">{t('contact.form.title')}</h3>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white max-w-md">
                      {formSubmitted ? (
                        <div className="text-center py-8">
                          <div className="text-5xl mb-4">✓</div>
                          <h4 className="text-xl font-semibold text-primary mb-2">{t('contact.form.successTitle')}</h4>
                          <p className="text-gray-600 mb-4">{t('contact.form.successMessage')}</p>
                          <button
                            onClick={() => setFormSubmitted(false)}
                            className="text-primary hover:underline text-sm"
                          >
                            {t('contact.form.sendAnother')}
                          </button>
                        </div>
                      ) : (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            
                            try {
                              const response = await fetch('https://api.web3forms.com/submit', {
                                method: 'POST',
                                body: formData
                              });
                              
                              if (response.ok) {
                                setFormSubmitted(true);
                                e.target.reset();
                              } else {
                                alert(t('contact.form.errorMessage'));
                              }
                            } catch (error) {
                              alert(t('contact.form.errorMessage'));
                            }
                          }}
                          className="space-y-3"
                        >
                          <input type="hidden" name="access_key" value="627d3e08-9c9b-4e68-877c-cf12d8d1f8fc" />
                          <input type="hidden" name="subject" value="Uusi palaute Ilojaloin-sivustolta" />
                          <input type="hidden" name="from_name" value="Ilojaloin Verkkosivusto" />
                          <input type="checkbox" name="botcheck" className="hidden" />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.name')}</label>
                            <input 
                              type="text" 
                              name="name"
                              required
                              className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-primary focus:border-primary" 
                              placeholder={t('contact.form.namePlaceholder')}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.email')}</label>
                            <input 
                              type="email" 
                              name="email"
                              required
                              className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-primary focus:border-primary" 
                              placeholder={t('contact.form.emailPlaceholder')}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.message')}</label>
                            <textarea 
                              name="message"
                              rows={5}
                              required
                              className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-primary focus:border-primary" 
                              placeholder={t('contact.form.messagePlaceholder')}
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryLight transition-colors"
                          >
                            {t('contact.form.send')}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full h-72 md:h-[420px] lg:h-[640px] border border-gray-200 rounded-lg overflow-hidden relative">
                  {mapLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                      <div className="loader" aria-hidden></div>
                    </div>
                  )}
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src="https://www.google.com/maps?q=Pitkänlahdenkatu+13,+65100+Vaasa&output=embed"
                    allowFullScreen
                    title={t('contact.mapTitle')}
                    onLoad={() => setMapLoading(false)}
                  ></iframe>
                  <div className="mt-3 text-sm text-right">
                    <a
                      href="https://www.google.com/maps?q=Pitkänlahdenkatu+13,+65100+Vaasa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {t('contact.mapLink')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Alatunniste */}
          {/* Booking (täysleveä tausta, sisällä keskitetty container) */}
          <section id="booking" className="py-16 md:py-20 px-4 bg-white">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl font-heading text-primary mb-6">{t('bookingSection.title')}</h2>
              <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('bookingSection.description') }} />
              <div className="w-full h-[600px] md:h-[75vh] lg:h-[85vh] border border-gray-200 rounded-lg overflow-auto relative">
                {velloLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                    <div className="loader" aria-hidden></div>
                  </div>
                )}
                {velloFailed && (
                  <div className="absolute inset-0 z-30">
                    <a
                      href={`https://vello.fi/ilojaloin-jalkaterapia?locale=${i18n.language === 'sv' ? 'sv' : i18n.language === 'en' ? 'en' : 'fi'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex items-center justify-center bg-primary text-white font-semibold rounded-md shadow-lg hover:opacity-95"
                    >
                      {t('bookingSection.failed')}
                    </a>
                  </div>
                )}
                <div ref={velloRef} data-vello-embed className="w-full min-h-full" />
              </div>             
            </div>
          </section>
          <footer className="py-6 bg-primary text-white text-center">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto px-4">
            &copy; {currentYear} {t('footer.rights')}
            <div className="text-sm mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span dangerouslySetInnerHTML={{ __html: t('footer.implementation') }}></span>
              <a 
                href="https://www.linkedin.com/in/teemu-paunonen-722621129/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center hover:opacity-80 transition-opacity"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <span className="hidden sm:inline">·</span>
              <a 
                href={i18n.language === 'sv' ? '/privacy-sv.html' : i18n.language === 'en' ? '/privacy-en.html' : '/privacy.html'} 
                className="text-white underline hover:opacity-80"
              >
                {t('footer.privacy')}
              </a>
              <span className="hidden sm:inline">·</span>
              <a 
                href={i18n.language === 'sv' ? '/self-monitoring-sv.html' : i18n.language === 'en' ? '/self-monitoring-en.html' : '/self-monitoring.html'} 
                className="text-white underline hover:opacity-80"
              >
                {t('footer.selfMonitoring')}
              </a>
            </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}