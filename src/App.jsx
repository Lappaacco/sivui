import React, { useState, useEffect, useRef } from 'react';

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
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [velloLoading, setVelloLoading] = useState(true);
  const [velloFailed, setVelloFailed] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const mobileMenuRef = useRef(null);
  const velloRef = useRef(null);
  const currentYear = new Date().getFullYear();

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

    // estä moninkertainen skriptin lisääminen
    const existing = document.querySelector('script[src="https://static.vello.fi/embed/v1.js"][data-url="ilojaloin-jalkaterapia"]');
    if (!existing) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://static.vello.fi/embed/v1.js';
      s.setAttribute('data-url', 'ilojaloin-jalkaterapia');
      s.setAttribute('data-lang', 'fi');
      root.appendChild(s);
    }

    // Tarkkaile milloin iframe ilmestyy
    const observer = new MutationObserver(() => {
      const iframe = root.querySelector('iframe');
      if (iframe) {
        setVelloLoading(false);
        observer.disconnect();
      }
      
      // Automaattisesti klikkaa "Varaa aika" -nappia jos se ilmestyy
      const clickable = Array.from(root.querySelectorAll('button, a'));
      const bookBtn = clickable.find((el) => el.innerText && /varaa\s*aika/i.test(el.innerText));
      if (bookBtn && !root.querySelector('iframe')) {
        bookBtn.click();
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
  }, []);

  return (
    <>
      {/* Mobiiliotsikko */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src="/ilojaloin.svg" alt="Ilojaloin - logo" className="w-10 h-10" />
          <div>
            <div className="text-xl font-heading text-primary">ILOJALOIN</div>
            <div className="text-xs italic text-gray-500 font-heading">Jalkaterapiapalvelut</div>
          </div>
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
      </header>
      {/* Mobiilivalikon lista */}
      {mobileMenuOpen && (
        <nav ref={mobileMenuRef} tabIndex={-1} className="md:hidden bg-white border-b border-gray-200 px-4 py-2 space-y-1 shadow-sm">
          <NavItem label="Etusivu" href="#home" active={activeSection === 'home'} onClick={handleNavClick} />
          <NavItem label="ILOJALOIN & minä" href="#about" active={activeSection === 'about'} onClick={handleNavClick} />
          <NavItem label="Jalkaterapia" href="#jalkaterapia" active={activeSection === 'jalkaterapia'} onClick={handleNavClick} />
          <NavItem label="Palveluni" href="#palveluni" active={activeSection === 'palveluni'} onClick={handleNavClick} />
          <NavItem label="Turvallisuus ja hygienia" href="#hygienia" active={activeSection === 'hygienia'} onClick={handleNavClick} />
          <NavItem label="Hinnoittelusta" href="#hinnoittelusta" active={activeSection === 'hinnoittelusta'} onClick={handleNavClick} />
          <NavItem label="Yhteystiedot" href="#contact" active={activeSection === 'contact'} onClick={handleNavClick} />
          <NavItem label="Ajanvaraus" href="#booking" active={activeSection === 'booking'} onClick={handleNavClick} />
        </nav>
      )}
      <div className="flex min-h-screen">
  {/* Sivupalkki tablet- ja desktop-koissa */}
  <nav className="hidden md:block w-56 bg-white border-r border-gray-200 shadow-md sticky top-0 h-screen flex-shrink-0 overflow-y-auto">
          <div className="p-6 flex items-center gap-3">
            <img src="/ilojaloin.svg" alt="Ilojaloin - logo" className="w-12 h-12" />
            <div>
              <div className="text-2xl font-heading text-primary mb-1">ILOJALOIN</div>
              <div className="text-sm italic text-gray-500 font-heading">Jalkaterapiapalvelut</div>
            </div>
          </div>
          <div className="px-4">
            <NavItem label="Etusivu" href="#home" active={activeSection === 'home'} onClick={handleNavClick} />
            <NavItem label="ILOJALOIN & minä" href="#about" active={activeSection === 'about'} onClick={handleNavClick} />
            <NavItem label="Jalkaterapia" href="#jalkaterapia" active={activeSection === 'jalkaterapia'} onClick={handleNavClick} />
            <NavItem label="Palveluni" href="#palveluni" active={activeSection === 'palveluni'} onClick={handleNavClick} />
            <NavItem label="Turvallisuus ja hygienia" href="#hygienia" active={activeSection === 'hygienia'} onClick={handleNavClick} />
            <NavItem label="Hinnoittelusta" href="#hinnoittelusta" active={activeSection === 'hinnoittelusta'} onClick={handleNavClick} />
            <NavItem label="Yhteystiedot" href="#contact" active={activeSection === 'contact'} onClick={handleNavClick} />
            <NavItem label="Ajanvaraus" href="#booking" active={activeSection === 'booking'} onClick={handleNavClick} />
          </div>
        </nav>
        {/* Pääsisältö */}
        <main className="flex-1 overflow-x-hidden">
          {/* Hero-osio (täysleveä tausta, sisällä keskitetty sisältö max-w-6xl) */}
          <section id="home" className="relative min-h-screen flex items-center justify-center bg-primaryLight text-white">
            <div className="text-center px-4 max-w-screen-xl lg:max-w-screen-2xl mx-auto">
              <img src="/Ilojaloinvalk.svg" alt="Ilojaloin - logo" className="mx-auto mb-6 w-40 sm:w-48 md:w-56 lg:w-64 xl:w-80 max-w-full h-auto" />
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading mb-4">Kepein askelin, Ilojaloin</h1>
              <p className="text-md md:text-lg lg:text-xl max-w-2xl mx-auto">
                Hyvinvoinnin askeleet alkavat jaloista. Tervetuloa Ilojaloin jalkaterapiaan!
              </p>
              <div className="mt-8 flex justify-center">
                <a
                  href="https://vello.fi/ilojaloin-jalkaterapia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-primary font-semibold rounded-md shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Varaa aika!
                </a>
              </div>
            </div>
          </section>

          {/* About section */}
          <section id="about" className="py-12 md:py-20 px-4 bg-white">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">Ilojaloin & minä</h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="rounded-lg bg-accentYellow h-64 flex items-center justify-center">
                  <span className="text-gray-400">Kuvapaikka yrittäjälle</span>
                </div>
                <div className="prose max-w-full">
                  <p>
                    Olen <strong>Satu Paunonen, jalkaterapeutti ja yrittäjä Vaasasta</strong> – 
                    sekä neljän lapsen äiti. Liikunta, luovuus ja perhe pitävät minut tasapainossa ja ihmisläheinen työ on minulle sydämen asia. 
                    Luonteeltani olen rauhallinen, ystävällinen ja peruspositiivinen. Olen utelias ja uuden oppimisesta innostuva ihminen. 
                    Rakastan kehittää ammattitaitoani ja pidän siitä, että jalkojen hoito on ala, jossa ei koskaan tule valmiiksi – aina on jotain uutta opittavaa.
                  </p>

                  <div className="my-4" aria-hidden></div>

                    <p>
                      Päädyin jalkaterapeutiksi omien kokemusteni kautta. Olen lapsesta asti kärsinyt lattajaloista ja erilaisista jalkavaivoista. 
                      Niiden myötä ymmärsin, miten suuri merkitys jaloilla on kokonaisvaltaiseen hyvinvointiin. Halusin oppia, miten voisin auttaa itseäni – ja samalla muita – voimaan paremmin.
                    </p>

                    <div className="my-4" aria-hidden></div>

                    <p>
                      Valmistuin <strong>jalkaterapeutiksi vuonna 2015 Mikkelin ammattikorkeakoulusta</strong> ja olen työskennellyt siitä lähtien <strong>Vaasan keskussairaalassa sisätautien poliklinikalla</strong>. 
                      Työssäni olen erikoistunut <strong>haavanhoitoon, diabeetikkojen ja reumaa sairastavien jalkaterapiaan sekä erilaisten kipujen ja virheasentojen hoitoon</strong>. 
                      Tämän työkokemuksen myötä voit istua hoitotuoliini täysin luottavaisin mielin – kaikenlaiset jalat on nähty. 
                    </p>

                  <div className="my-4" aria-hidden></div>

                  <p>
                    Yrittäjyys on ollut mielessäni jo pitkään – ajatus vapaudesta tehdä työtä omien arvojen mukaisesti, luovasti ja ihmisläheisesti. 
                    Ilojaloin syntyi halusta auttaa ihmisiä voimaan paremmin ja edistää jalkojen terveyttä laajasti ja ennakoivasti. 
                    Haluan, että jokainen kohtaaminen on askel kohti kevyempää, kivuttomampaa arkea.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Jalkaterapia section */}
          <section id="jalkaterapia" className="py-12 md:py-20 px-4 bg-offwhite">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">Jalkaterapia</h2>
              <div className="prose max-w-full">
                <p>
                  Jalkaterapeutiksi valmistuminen edellyttää <strong>terveydenhuollon koulutusta</strong>. 
                  Suomessa koulutus järjestetään <strong>ammattikorkeakouluissa</strong>, ja se kestää tyypillisesti 3,5 vuotta, sisältäen sekä <strong>teoriaopintoja että laajaa käytännön harjoittelua</strong>. 
                  Opintojen aikana opiskelija perehtyy <strong>ihmisen anatomiaan, fysiologiaan ja biomekaniikkaan</strong> sekä erilaisiin jalkoihin vaikuttaviin sairauksiin. 
                  Lisäksi koulutus kattaa jalkojen tutkimisen ja analysoinnin, terveyden ylläpidon ja ennaltaehkäisevän hoidon, haavojen, ihomuutosten ja kynsiongelmien hoidon, yksilöllisten tukien, pohjallisten ja varvasorteesien valmistamisen sekä liikunta- ja harjoitusohjelmien suunnittelun jalan ja alaraajojen tukemiseksi.
                </p>
                <div className="my-4" aria-hidden></div>
                <p>
                  Jalkaterapia on kokonaisvaltaista hyvinvointia jaloillesi.
                  Se auttaa <strong>ehkäisemään ja hoitamaan erilaisia jalkavaivoja, kiputiloja ja virheasentoja</strong>, parantaa liikkumiskykyä, lievittää kipua ja edistää arjen sujuvuutta. 
                  Koska jokainen jalka on yksilöllinen, hoito suunnitellaan aina asiakkaan tarpeiden mukaan. 
                </p>
              </div>
            </div>
          </section>

          {/* Palveluni section */}
          <section id="palveluni" className="py-12 md:py-20 px-4 bg-white">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">Palveluni</h2>
              <div className="prose max-w-full">
                <p>
                  Ilojaloissa tarjoan <strong>monipuolisia jalkaterapiapalveluja</strong>, kuten:
                </p>
                <div className="my-4" aria-hidden></div>
                <ul className="list-none space-y-2">
                  <li>🦶 <strong>Tutkimukset ja jalka-analyysit</strong> – kartoitetaan jalkojen kunto ja mahdolliset ongelmakohdat</li>
                  <li>💅 <strong>Kynnenoikaisuhoidot & kynsiproteesit</strong> – korjaavat ja suojaavat kynsiä</li>
                  <li>💅 <strong>Kynsien lyhentäminen & ohentaminen</strong> - hankalatkin kynnet hoituvat</li>
                  <li>🦶 <strong>Ihon hoito</strong> – halkeamat, kovettumat, känsät</li>
                  <li>🦵 <strong>Haavanhoito ja kevennyshoito</strong> – erityisesti kroonisten jalkahaavojen hoitoon</li>
                  <li>🦶 <strong>Syylänhoito</strong></li>
                  <li>🦶 <strong>Apu kynsisieneen tai jalkasilsaan</strong></li>
                  <li>🦶 <strong>Yksilölliset harjoitteet </strong></li>
                  <li>🩹 <strong>Urheilu- ja kinesioteippaus</strong></li>
                  <li>🩰 <strong>Pikapohjalliset ja yksilölliset varvasorteesit silikonimassasta</strong></li>
                  <li>👟 <strong>Kenkäohjaus</strong> – tarkistetaan kenkien sopivuus, suositellaan sopivaa mallia tai ominaisuutta ja mahdollisuus tilata laadukkaita paljasjalkakenkiä kauttani</li>
                  <li>🛍️ <strong>Laadukkaat omahoitotuotteet</strong> – kotihoitoon ja jalkaterveyden ylläpitoon</li>
                  <li>❤️ <strong>Erikoisryhmien jalkaterapia</strong> – diabetes, reuma, psoriasis jne.</li>
                  <li>🙂 <strong>Luennot</strong></li>
                </ul>
                <div className="my-4" aria-hidden></div>
                <p>
                  Jokainen hoito suunnitellaan asiakkaan tarpeiden mukaan ja toteutetaan kiireettä, lämmöllä ja ammattitaidolla. 
                  Jalkaterapiaan voi tulla myös ilman varsinaista vaivaa tai kiputilaa. Myös ennaltaehkäisy on tärkeää. 
                  Tuntemalla jalkasi osaat hoitaa ne hyvin ja vältyt tulevaisuudessa mahdollisesti ilmeneviltä ongelmilta. 
                  Jalkaterveyttään voi aina parantaa ja se vaikuttaa koko hyvinvointiin!
                </p>
              </div>
            </div>
          </section>

          {/* Turvallisuus ja hygienia section */}
          <section id="hygienia" className="py-12 md:py-20 px-4 bg-offwhite">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">Turvallisuus ja hygienia</h2>
              <div className="prose max-w-full">
                <p>
                  Käytössäni on markkinoiden laadukkaimmat ja turvallisimmat laitteet. Hoitotuolini on vakaa, tukeva ja nostaa kevyesti jopa 200 kiloa. 
                  Se laskeutuu matalalle, joten kyytiin on helppo nousta. Erikoispaksu pehmuste takaa mukavan asennon koko hoidon ajaksi.
                </p>
                <div className="my-4" aria-hidden></div>
                <p>
                  Ihon ja kynsien hionnassa käytän vesiporaa, joka viilentää ja sitoo pölyn – iho ei kuumene eikä hiomapöly leijaile ilmaan. Näin sekä sinä että minä hengitämme puhdasta ilmaa.
                </p>
                <div className="my-4" aria-hidden></div>
                <p>
                  Jalkapeilini matala rakenne mahdollistaa jalkojen kuormituksen ja asennon tarkan arvioinnin.
                </p>
                <div className="my-4" aria-hidden></div>
                <p>
                  Kaikki välineeni huolletaan huolellisesti uusilla, ammattikäyttöön tarkoitetuilla välinehuoltolaitteilla. 
                  Välineet desinfioidaan ultraäänipesurissa, steriloidaan autoklaavissa ja säilytetään steriileissä pusseissa suljetussa kaapissa.
                </p>
                <div className="my-4" aria-hidden></div>
                <p>
                  Tilat siistitään jokaisen asiakkaan jälkeen tehokkailla aineilla, jotka tuhoavat bakteerit, virukset ja sienet.
                </p>
                <p>
                  <strong>Sinun turvallisuutesi ja hyvinvointisi ovat minulle tärkeintä.</strong>
                </p>
                <div className="my-4" aria-hidden></div>
                <p>
                  Asiakastietojesi turvallisuudesta huolehdin yhtä tarkasti. 
                  Käytössäni on <strong>Vello-potilastietojärjestelmä</strong>, joka on <strong>tietoturvallinen ja Kanta-yhteensopiva</strong>, joten tietosi säilyvät suojattuina ja luottamuksellisina.
                </p>
              </div>
            </div>
          </section>

          {/* Hinnoittelusta section */}
          <section id="hinnoittelusta" className="py-12 md:py-20 px-4 bg-white">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto w-full">
              <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">Hinnoittelusta</h2>
              <div className="prose max-w-full mb-8">
                <p>
                  Jalkaterapia on aikaveloitteista. Tunnissa ehdin jo monta asiaa ihon- ja kynsienhoidon lisäksi, mikä on perusteluni korkeammalle hinnalle verraten esimerkiksi jalkojenhoitajien hinnoitteluun. 
                  Jalkaterapia on terveydenhuoltoa ja siksi tarvitsen henkilötietosi. Minulla on kirjausvelvoite ja kirjaan käyntisi tiedot Omakantaan. Se vie aikansa, samoin valmistelut ja loppusiivous. 
                </p>
                <p className="mt-4">
                  <strong>Minulla käyvät hyvinvointiedut:</strong> E-passi, Edenred ja Smartum.
                </p>
              </div>

              <h3 className="text-2xl font-heading text-primary mb-4">Hinnastoni</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-primaryLight text-left">
                      <th className="px-4 py-3 font-medium border border-gray-300">Palvelu</th>
                      <th className="px-4 py-3 font-medium border border-gray-300">Aika</th>
                      <th className="px-4 py-3 font-medium border border-gray-300">Hinta</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-3 border border-gray-300" rowSpan="1">
                        <strong>Jalkaterapia</strong>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>Shoppailuvartti</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>Kartoitetaan omahoidon tarve ja suositellaan omahoitotuotteet</li>
                          <li>Myös esimerkiksi varvasorteesin muokkaukselle kannattaa varata tämä aika (1 muokkauskerta ilmainen)</li>
                          <li>Kenkien hankinta/sovitus</li>
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">0€</td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300" rowSpan="4">
                        <strong>Jalkaterapia</strong>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>30 min</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>Varaa tämä aika, jos tiedät, että haluat ainoastaan syylänhoidon tai kynnenoikaisuhoidon (+15€ materiaalimaksu)</li>
                          <li>Tässä ajassa ehtii myös hoitamaan siistit jalat ja antamaan omahoidonohjausta ja suositukset tuotteisiin. Samoin kenkäasioita voidaan käydä läpi.</li>
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">45€</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>45 min</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>Varaa tämä aika jos sinulla on mitään kipuja tai vaivoja jaloissa, niin tutkitaan niitä enemmän. Tutkimisen lisäksi voi olla aikaa johonkin toimenpiteisiin.</li>
                          <li>Myös hieman hankalampien jalkojen hoito voi hoitua tässä ajassa esim. On iholla/kynsissä jonkinverran paksuuntumaa.</li>
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">65€</td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>60 min</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>Ehtii jo tutkia jalat ja alkaa tarvittaviin toimenpiteisiin.</li>
                          <li>Varaa myös jos iholla ja kynsissä on paljon hoidettavaa esim. Paljon känsiä ja paksuja kovettumia tai on hyvin paksut kynnet.</li>
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">85€</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 border border-gray-300">
                        <strong>75 min</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>Tässä ajassa ehtii jo muutamankin toimenpiteen tehdä tutkimisen lisäksi.</li>
                        </ul>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">105€</td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300"><strong>Lasten jalkaterapia</strong></td>
                      <td className="px-4 py-3 border border-gray-300"><strong>30 min</strong></td>
                      <td className="px-4 py-3 border border-gray-300">35€</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 border border-gray-300"><strong>Luennot</strong></td>
                      <td className="px-4 py-3 border border-gray-300">
                        Tarjoan jalkaterveysaiheisia luentoja erilaisille yhdistyksille, kouluille ja työyhteisöille. Ota yhteyttä, niin sovitaan!
                      </td>
                      <td className="px-4 py-3 border border-gray-300"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 p-6 bg-accentYellow rounded-lg">
                <p className="text-lg">
                  <strong>HUOM!</strong> Jos sinua askarruttaa minkä ajan varaisit, aina voi soittaa ja kysyä! 
                  En vastaa puhelimeen, jos olen varattuna, mutta soitan kyllä takaisin, kun ehdin.
                </p>
                <p className="mt-2 text-lg">
                  <strong>Puhelin:</strong>{' '}
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
                  <h2 className="text-3xl md:text-4xl font-heading text-primary mb-6">Yhteystiedot</h2>
                  <p className="mb-2">
                    <strong>Osoite:</strong>{' '}
                    <span className="text-gray-600">Pitkänlahdenkatu 13, 65100 Vaasa</span>
                  </p>
                  <p className="mb-2">
                    <strong>Puhelin:</strong>{' '}
                    <a href="tel:+358440684567" className="text-primary hover:underline">
                      +358 44 068 4567
                    </a>
                  </p>
                  <p className="mb-2">
                    <strong>Sähköposti:</strong>{' '}
                    <a href="mailto:ilojaloin@ilojaloin.fi" className="text-primary hover:underline">
                      ilojaloin@ilojaloin.fi
                    </a>
                  </p>
                  <p className="mb-4">
                    <strong>Y‑tunnus:</strong> 3288544-8
                  </p>
                  <p>
                    Ole yhteydessä kaikissa jalkaterapiaan liittyvissä kysymyksissä – autamme
                    mielellämme!
                  </p>
                  <div className="my-6">
                    <h3 className="text-xl font-heading text-primary mb-3">Anna palautetta</h3>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white max-w-md">
                      {formSubmitted ? (
                        <div className="text-center py-8">
                          <div className="text-5xl mb-4">✓</div>
                          <h4 className="text-xl font-semibold text-primary mb-2">Kiitos palautteesta!</h4>
                          <p className="text-gray-600 mb-4">Viestisi on lähetetty onnistuneesti.</p>
                          <button
                            onClick={() => setFormSubmitted(false)}
                            className="text-primary hover:underline text-sm"
                          >
                            Lähetä uusi viesti
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
                                alert('Viestin lähetys epäonnistui. Yritä uudelleen tai lähetä sähköpostilla.');
                              }
                            } catch (error) {
                              alert('Viestin lähetys epäonnistui. Yritä uudelleen tai lähetä sähköpostilla.');
                            }
                          }}
                          className="space-y-3"
                        >
                          <input type="hidden" name="access_key" value="627d3e08-9c9b-4e68-877c-cf12d8d1f8fc" />
                          <input type="hidden" name="subject" value="Uusi palaute Ilojaloin-sivustolta" />
                          <input type="hidden" name="from_name" value="Ilojaloin Verkkosivusto" />
                          <input type="checkbox" name="botcheck" className="hidden" />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nimi</label>
                            <input 
                              type="text" 
                              name="name"
                              required
                              className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-primary focus:border-primary" 
                              placeholder="Sinun nimesi"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sähköposti</label>
                            <input 
                              type="email" 
                              name="email"
                              required
                              className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-primary focus:border-primary" 
                              placeholder="email@email.fi"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Viesti</label>
                            <textarea 
                              name="message"
                              rows={5}
                              required
                              className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-primary focus:border-primary" 
                              placeholder="Kirjoita palautteesi tähän..."
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryLight transition-colors"
                          >
                            Lähetä palaute
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
                    title="Kartta"
                    onLoad={() => setMapLoading(false)}
                  ></iframe>
                  <div className="mt-3 text-sm text-right">
                    <a
                      href="https://www.google.com/maps?q=Pitkänlahdenkatu+13,+65100+Vaasa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Avaa kartta suuremmassa näkymässä
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
              <h2 className="text-3xl font-heading text-primary mb-6">Ajanvaraus</h2>
              <p className="mb-4">
                Voit varata ajan kätevästi Vello‑järjestelmän kautta alla olevasta kalenterista.{' '}
                Tai halutessasi voit avata
                {' '}
                <a
                  href="https://vello.fi/ilojaloin-jalkaterapia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Vellon oman ajanvaraus­sivun
                </a>
                {' '}
                uuteen välilehteen.
              </p>
              <div className="w-full h-[55vh] md:h-[75vh] lg:h-[85vh] border border-gray-200 rounded-lg overflow-hidden relative flex flex-col">
                {velloLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                    <div className="loader" aria-hidden></div>
                  </div>
                )}
                {velloFailed && (
                  <div className="absolute inset-0 z-30">
                    <a
                      href="https://vello.fi/ilojaloin-jalkaterapia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex items-center justify-center bg-primary text-white font-semibold rounded-md shadow-lg hover:opacity-95"
                    >
                      Avaa ajanvaraus Vellossa
                    </a>
                  </div>
                )}
                <div ref={velloRef} data-vello-embed className="w-full flex-1 overflow-auto" />
              </div>             
            </div>
          </section>
          <footer className="py-6 bg-primary text-white text-center">
            <div className="max-w-screen-xl lg:max-w-screen-2xl mx-auto px-4">
            &copy; {currentYear} Ilojaloin Jalkaterapiapalvelut. Kaikki oikeudet pidätetään.
            <div className="text-sm mt-2 flex items-center justify-center gap-2">
              <span>Sivuston toteutus: <strong>Teemu Paunonen</strong></span>
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
              <span>·</span>
              <a href="/privacy.html" className="text-white underline hover:opacity-80">Tietosuojaseloste</a>
            </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}