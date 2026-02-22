import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Navigaatiolinkin komponentti. Vastaanottaa tekstin, kohteen ankkurin,
 * aktiivisuuden sekä valinnaisen onClick-tapahtumakäsittelijän.
 */
function NavItem({ label, targetId, active, onClick }) {
  const baseClasses =
    'block px-4 py-2 mt-2 rounded-lg transition-colors font-semibold font-heading cursor-pointer select-none';
  const activeClasses = 'bg-primary text-white shadow';
  const inactiveClasses = 'text-primary hover:bg-primaryLight hover:text-white';
  const className = `${baseClasses} ${active ? activeClasses : inactiveClasses}`;
  
  const handleClick = () => {
    const isMobile = window.innerWidth < 768;
    
    // Sulje mobiilivalikko ensin
    if (onClick) onClick();
    
    // Odota hetki että valikko sulkeutuu ennen scrollia (mobiililla)
    const scrollDelay = isMobile ? 100 : 0;
    
    setTimeout(() => {
      const element = document.querySelector(`[data-section="${targetId}"]`);
      if (element) {
        // Mobiili: Vain header (~80px) koska valikko on jo suljettu
        // Desktop: Pieni offset koska sivupalkki ei ole ylhäällä
        const offset = isMobile ? 80 : 20;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, scrollDelay);
  };
  
  return (
    <div 
      role="button" 
      tabIndex={0}
      className={className} 
      onClick={handleClick}
      onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      {label}
    </div>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [velloModalOpen, setVelloModalOpen] = useState(false);
  const [velloLoading, setVelloLoading] = useState(false);
  const [velloFailed, setVelloFailed] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const mobileMenuRef = useRef(null);
  const velloRef = useRef(null);

  // Update SEO meta tags when language changes
  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = i18n.language;
    
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
    
    // Update Open Graph locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      const localeMap = { fi: 'fi_FI', sv: 'sv_SE', en: 'en_US' };
      ogLocale.setAttribute('content', localeMap[i18n.language] || 'fi_FI');
    }
    
    // Update canonical URL to remove query parameters
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    // Always point canonical to the base URL without query parameters
    canonicalLink.setAttribute('href', 'https://ilojaloin.fi/');
    
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
    const sections = Array.from(document.querySelectorAll('[data-section]'));
    let ticking = false;

    function updateActive() {
      let current = 'home';
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          current = sec.getAttribute('data-section') || current;
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

  // Poista hash URL:sta automaattisesti jos se ilmestyy
  useEffect(() => {
    const removeHash = () => {
      if (window.location.hash) {
        window.history.replaceState(null, null, window.location.pathname);
      }
    };
    
    // Kuuntele hashchange-eventtejä
    window.addEventListener('hashchange', removeHash);
    // Tarkista heti kun komponentti mounttaa
    removeHash();
    
    return () => {
      window.removeEventListener('hashchange', removeHash);
    };
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      const images = t('gallery.images', { returnObjects: true });
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((lightboxIndex + 1) % images.length);
      }
    };

    // Disable body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxOpen, lightboxIndex, t]);

  // Keyboard navigation and scroll lock for Vello modal
  useEffect(() => {
    if (!velloModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setVelloModalOpen(false);
      }
    };

    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [velloModalOpen]);

  // Focus mobile menu when it opens
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      setTimeout(() => {
        const firstLink = mobileMenuRef.current.querySelector('a, button');
        if (firstLink) firstLink.focus();
      }, 250);
    }
  }, [mobileMenuOpen]);

    // Inject Vello embed script only when modal is open
  useEffect(() => {
    if (!velloModalOpen) return;
    
    const root = velloRef.current;
    if (!root) return;

    // Reset loading states
    setVelloLoading(true);
    setVelloFailed(false);

    // Määritä Vellon kieli nykyisen i18n-kielen mukaan
    const velloLang = i18n.language === 'sv' ? 'sv' : i18n.language === 'en' ? 'en' : 'fi';

    // Poista vanha skripti ja iframe kokonaan
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
      
      // Clean up when modal closes
      if (root) {
        root.innerHTML = '';
      }
      const script = document.querySelector('script[src=\"https://static.vello.fi/embed/v1.js\"][data-url=\"ilojaloin-jalkaterapia\"]');
      if (script) {
        script.remove();
      }
    };
  }, [velloModalOpen, i18n.language]);

  return (
    <>
      {/* Mobiiliotsikko */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div
          onClick={() => {
            const element = document.querySelector('[data-section="home"]');
            if (element) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img src="/ilojaloin.svg" alt="Ilojaloin - logo" className="w-10 h-10" />
          <div>
            <div className="text-xl font-heading text-primary">ILOJALOIN</div>
            <div className="text-xs italic text-gray-500 font-heading">{t('logo.subtitle')}</div>
          </div>
        </div>
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
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
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
        <nav ref={mobileMenuRef} tabIndex={-1} className="md:hidden bg-white border-b border-gray-200 px-4 py-2 space-y-1 shadow-sm sticky top-[73px] z-10">
          <NavItem label={t('nav.home')} targetId="home" active={activeSection === 'home'} onClick={handleNavClick} />
          <NavItem label={t('nav.services')} targetId="services" active={activeSection === 'services'} onClick={handleNavClick} />
          <NavItem label={t('nav.pricing')} targetId="pricing" active={activeSection === 'pricing'} onClick={handleNavClick} />
          <NavItem label={t('nav.pricingInfo')} targetId="pricingInfo" active={activeSection === 'pricingInfo'} onClick={handleNavClick} />
          <NavItem label={t('nav.footTherapy')} targetId="jalkaterapia" active={activeSection === 'jalkaterapia'} onClick={handleNavClick} />
          <NavItem label={t('nav.about')} targetId="about" active={activeSection === 'about'} onClick={handleNavClick} />
          <NavItem label={t('nav.hygiene')} targetId="hygienia" active={activeSection === 'hygienia'} onClick={handleNavClick} />
          <NavItem label={t('nav.contact')} targetId="contact" active={activeSection === 'contact'} onClick={handleNavClick} />
          <NavItem label={t('nav.gallery')} targetId="gallery" active={activeSection === 'gallery'} onClick={handleNavClick} />
          <NavItem label={t('nav.booking')} targetId="booking" active={activeSection === 'booking'} onClick={handleNavClick} />
        </nav>
      )}
      <div className="flex min-h-screen">
  {/* Sivupalkki tablet- ja desktop-koissa */}
  <nav className="hidden md:block w-56 bg-white border-r border-gray-200 shadow-md sticky top-0 h-screen flex-shrink-0 overflow-y-auto">
          <div
            onClick={() => {
              const element = document.querySelector('[data-section="home"]');
              if (element) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="p-6 flex items-center gap-3 cursor-pointer"
          >
            <img src="/ilojaloin.svg" alt="Ilojaloin - logo" className="w-12 h-12" />
            <div>
              <div className="text-2xl font-heading text-primary mb-1">ILOJALOIN</div>
              <div className="text-sm italic text-gray-500 font-heading">{t('logo.subtitle')}</div>
            </div>
          </div>
          <div className="px-4">
            <NavItem label={t('nav.home')} targetId="home" active={activeSection === 'home'} onClick={handleNavClick} />
            <NavItem label={t('nav.services')} targetId="services" active={activeSection === 'services'} onClick={handleNavClick} />
            <NavItem label={t('nav.pricing')} targetId="pricing" active={activeSection === 'pricing'} onClick={handleNavClick} />
            <NavItem label={t('nav.pricingInfo')} targetId="pricingInfo" active={activeSection === 'pricingInfo'} onClick={handleNavClick} />
            <NavItem label={t('nav.footTherapy')} targetId="jalkaterapia" active={activeSection === 'jalkaterapia'} onClick={handleNavClick} />
            <NavItem label={t('nav.about')} targetId="about" active={activeSection === 'about'} onClick={handleNavClick} />
            <NavItem label={t('nav.hygiene')} targetId="hygienia" active={activeSection === 'hygienia'} onClick={handleNavClick} />
            <NavItem label={t('nav.contact')} targetId="contact" active={activeSection === 'contact'} onClick={handleNavClick} />
            <NavItem label={t('nav.gallery')} targetId="gallery" active={activeSection === 'gallery'} onClick={handleNavClick} />
            <NavItem label={t('nav.booking')} targetId="booking" active={activeSection === 'booking'} onClick={handleNavClick} />
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
          <section data-section="home" className="relative min-h-screen flex items-center justify-center bg-primaryLight text-white">
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
                  className="inline-flex items-center px-6 py-3 md:px-10 md:py-5 md:text-xl bg-white text-primary font-semibold rounded-md shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                >
                  {t('hero.bookButton')}
                </a>
              </div>
              
            </div>
          </section>

          <section data-section="services" className="py-12 md:py-20 px-4 bg-white">
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

          <section data-section="pricing" className="py-12 md:py-20 px-4 bg-offwhite">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-8">{t('pricing.title')}</h2>
              
              {/* Desktop taulukko */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 bg-white">
                  <thead>
                    <tr className="bg-primaryLight">
                      <th className="px-4 py-3 text-left font-semibold border border-gray-300">{t('pricing.serviceLabel')}</th>
                      <th className="px-4 py-3 text-right font-semibold border border-gray-300">{t('pricing.priceLabel')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t('pricing.services', { returnObjects: true }).map((service, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 border border-gray-300">{service.name}</td>
                        <td className="px-4 py-3 text-right border border-gray-300 font-semibold">{service.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobiili korttinäkymä - hinnat oikealla, kaikki rivittyy */}
              <div className="md:hidden space-y-3">
                {t('pricing.services', { returnObjects: true }).map((service, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start gap-3">
                      <div className="text-sm text-gray-700 break-words flex-1">{service.name}</div>
                      <div className="text-sm font-semibold text-gray-800 break-words text-right min-w-0 max-w-[45%]">{service.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-heading text-primary mb-4">{t('pricing.additionalTitle')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('pricing.additionalSubtitle')}</p>
                
                {/* Desktop taulukko */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 bg-white">
                    <thead>
                      <tr className="bg-primaryLight">
                        <th className="px-4 py-3 text-left font-semibold border border-gray-300">{t('pricing.serviceLabel')}</th>
                        <th className="px-4 py-3 text-right font-semibold border border-gray-300">{t('pricing.priceLabel')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t('pricing.additional', { returnObjects: true }).map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 border border-gray-300">{item.name}</td>
                          <td className="px-4 py-3 text-right border border-gray-300 font-semibold">{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobiili korttinäkymä - hinnat oikealla, kaikki rivittyy */}
                <div className="md:hidden space-y-3">
                  {t('pricing.additional', { returnObjects: true }).map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="flex justify-between items-start gap-3">
                        <div className="text-sm text-gray-700 break-words flex-1">{item.name}</div>
                        <div className="text-sm font-semibold text-gray-800 break-words text-right min-w-0 max-w-[45%]">{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Hinnoittelusta section */}
          <section data-section="pricingInfo" className="py-12 md:py-20 px-4 bg-white">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">{t('pricingInfo.title')}</h2>
              <div className="prose max-w-full">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">{t('pricingInfo.question')}</h3>
                <p className="mb-4">{t('pricingInfo.paragraph1')}</p>
                <p className="mb-4">{t('pricingInfo.paragraph2')}</p>
                <p className="mb-4">{t('pricingInfo.paragraph3')}</p>
                <p className="mb-4">{t('pricingInfo.paragraph4')}</p>
                <p className="mb-4">{t('pricingInfo.paragraph5')}</p>
                <p className="font-semibold">{t('pricingInfo.paragraph6')}</p>
              </div>
            </div>
          </section>

          {/* Jalkaterapia section */}
          <section data-section="jalkaterapia" className="py-12 md:py-20 px-4 bg-offwhite">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">{t('footTherapy.title')}</h2>
              <div className="prose max-w-full">
                <p dangerouslySetInnerHTML={{ __html: t('footTherapy.paragraph1') }}></p>
                <div className="my-4" aria-hidden></div>
                <p dangerouslySetInnerHTML={{ __html: t('footTherapy.paragraph2') }}></p>
              </div>
            </div>
          </section>

          {/* About section */}
          <section data-section="about" className="py-12 md:py-20 px-4 bg-white">
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

          {/* Turvallisuus ja hygienia section */}
          <section data-section="hygienia" className="py-12 md:py-20 px-4 bg-offwhite">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">{t('hygiene.title')}</h2>
              <div className="prose max-w-full">
                <p>{t('hygiene.paragraph1')}</p>
                <div className="my-4" aria-hidden></div>
                <p>{t('hygiene.paragraph2')}</p>
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

          {/* Yhteystieto-osio */}
          <section data-section="contact" className="py-12 md:py-20 px-4 bg-white">
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
                      className="inline-flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="Facebook"
                    >
                      <img src="/Facebook_Logo_Primary.png" alt="Facebook" className="h-12 w-auto" />
                    </a>
                    <a
                      href="https://www.instagram.com/ilojaloin?igsh=MWdqMnB3bDg5MW90eA=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="Instagram"
                    >
                      <img src="/Instagram_Glyph_Gradient.png" alt="Instagram" className="h-12 w-auto" />
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
                    src={`https://www.google.com/maps?q=Pitkänlahdenkatu+13,+65100+Vaasa&output=embed&hl=${i18n.language}`}
                    allowFullScreen
                    title={t('contact.mapTitle')}
                    onLoad={() => setMapLoading(false)}
                    key={i18n.language}
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

          {/* Gallery section */}
          <section data-section="gallery" className="py-12 md:py-20 px-4 bg-offwhite">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-4">{t('gallery.title')}</h2>
              <p className="text-gray-600 mb-8">{t('gallery.description')}</p>
              
              {/* Thumbnail grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {t('gallery.images', { returnObjects: true }).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                    className="group relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <img 
                      src={`/gallery/galleria${index + 1}.jpg`}
                      alt={img.caption}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-2xl">🔍</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Lightbox Modal */}
          {lightboxOpen && (
            <div 
              className="fixed inset-0 bg-black/95 z-50 flex flex-col"
              onClick={(e) => {
                if (e.target === e.currentTarget) setLightboxOpen(false);
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-50 w-12 h-12 flex items-center justify-center"
                aria-label="Sulje"
              >
                ×
              </button>

              {/* Main image area */}
              <div 
                className="flex-1 flex items-center justify-center px-4 md:px-16 pb-32 pt-16"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setLightboxOpen(false);
                }}
              >
                <div className="relative max-w-6xl w-full">
                  {/* Previous arrow - mobile: on image, desktop: outside */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const images = t('gallery.images', { returnObjects: true });
                      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
                    }}
                    className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-12 text-white hover:text-gray-300 text-4xl md:text-6xl z-10 bg-black/50 md:bg-transparent w-10 h-10 md:w-auto md:h-auto rounded-full flex items-center justify-center md:block"
                    aria-label="Edellinen"
                  >
                    ‹
                  </button>

                  {/* Image */}
                  <div className="relative">
                    <img
                      src={`/gallery/galleria${lightboxIndex + 1}.jpg`}
                      alt={`Galleriakuva ${lightboxIndex + 1}`}
                      className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                    />
                  </div>

                  {/* Next arrow - mobile: on image, desktop: outside */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const images = t('gallery.images', { returnObjects: true });
                      setLightboxIndex((lightboxIndex + 1) % images.length);
                    }}
                    className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-12 text-white hover:text-gray-300 text-4xl md:text-6xl z-10 bg-black/50 md:bg-transparent w-10 h-10 md:w-auto md:h-auto rounded-full flex items-center justify-center md:block"
                    aria-label="Seuraava"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Thumbnail carousel at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 py-4 md:py-6 px-4">
                <div className="max-w-6xl mx-auto">
                  <div className="flex items-center justify-center gap-2 overflow-x-hidden">
                    {t('gallery.images', { returnObjects: true }).map((img, index) => {
                      // Circular scroll: show 2-3 images on each side
                      const images = t('gallery.images', { returnObjects: true });
                      const totalImages = images.length;
                      const visibleRange = window.innerWidth < 640 ? 5 : 7; // 5 on mobile, 7 on desktop
                      const halfRange = Math.floor(visibleRange / 2);
                      
                      // Calculate if this thumbnail should be visible
                      let distance = Math.abs(index - lightboxIndex);
                      let circularDistance = Math.min(distance, totalImages - distance);
                      let isVisible = circularDistance <= halfRange;

                      if (!isVisible) return null;

                      return (
                        <button
                          key={index}
                          onClick={() => setLightboxIndex(index)}
                          className={`flex-shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                            index === lightboxIndex 
                              ? 'ring-2 md:ring-4 ring-primary scale-110' 
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={`/gallery/galleria${index + 1}.jpg`}
                            alt={img.caption}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking (täysleveä tausta, sisällä keskitetty container) */}
          <section data-section="booking" className="py-16 md:py-20 px-4 bg-white">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl font-heading text-primary mb-6">{t('bookingSection.title')}</h2>
              <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('bookingSection.description') }} />
              
              {/* Gift card info - left aligned */}
              <p className="text-gray-700 mb-6">
                🎁 {t('bookingSection.giftCardInfo')}
              </p>

              {/* Vello preview - clickable to open modal */}
              <div 
                onClick={() => setVelloModalOpen(true)}
                className="relative cursor-pointer rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow group"
                style={{ maxWidth: '1000px', margin: '0 auto' }}
              >
                {/* Preview iframe container */}
                <div className="relative w-full" style={{ height: '500px', pointerEvents: 'none' }}>
                  <iframe
                    src={`https://vello.fi/ilojaloin-jalkaterapia?locale=${i18n.language === 'sv' ? 'sv' : i18n.language === 'en' ? 'en' : 'fi'}`}
                    className="w-full h-full border-0"
                    title="Ajanvaraus preview"
                  />
                </div>
                
                {/* Overlay with click prompt */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center">
                  <div className="bg-white/95 px-8 py-6 rounded-lg shadow-2xl text-center transform group-hover:scale-105 transition-transform">
                    <p className="text-2xl font-heading text-primary mb-2">📅 {t('bookingSection.title')}</p>
                    <p className="text-gray-700">{t('bookingSection.clickToOpen') || 'Klikkaa avataksesi ajanvarauksen'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Vello Booking Modal */}
          {velloModalOpen && (
            <div 
              className="fixed inset-0 bg-black/95 z-50 flex flex-col"
              onClick={(e) => {
                if (e.target === e.currentTarget) setVelloModalOpen(false);
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setVelloModalOpen(false)}
                className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-50 w-12 h-12 flex items-center justify-center"
                aria-label="Sulje"
              >
                ×
              </button>

              {/* Booking content area */}
              <div 
                className="flex-1 flex items-center justify-center p-2 md:p-6"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setVelloModalOpen(false);
                }}
              >
                <div className="w-full h-full max-w-[98vw] max-h-[98vh] md:max-w-[96vw] md:max-h-[92vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="bg-primary text-white p-3 md:p-4 flex-shrink-0">
                    <h2 className="text-xl md:text-2xl font-heading">{t('bookingSection.title')}</h2>
                  </div>
                  
                  {/* Vello embed container */}
                  <div className="w-full flex-1 relative bg-gray-50 overflow-auto min-h-0">
                    {velloLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                        <div className="loader" aria-hidden></div>
                      </div>
                    )}
                    {velloFailed && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center p-8">
                        <div className="text-center">
                          <p className="mb-4 text-gray-700">{t('bookingSection.failed')}</p>
                          <a
                            href={`https://vello.fi/ilojaloin-jalkaterapia?locale=${i18n.language === 'sv' ? 'sv' : i18n.language === 'en' ? 'en' : 'fi'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:opacity-95 text-lg inline-block"
                          >
                            Avaa Vello
                          </a>
                        </div>
                      </div>
                    )}
                    <div 
                      ref={velloRef} 
                      data-vello-embed 
                      className="w-full h-full min-h-[600px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

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