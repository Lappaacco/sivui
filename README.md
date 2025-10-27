# Ilojaloin-sivuston lähdekoodi

Tämä hakemisto sisältää React– ja Tailwind CSS –pohjaisen lähdekoodin Ilojaloin
jalkaterapia‑yrityksen kotisivulle. Projektissa käytetään Viteä kehityksen ja
rinnakkaisen buildin hallintaan. Lähdekoodi on helppo muokata ja laajentaa,
esimerkiksi lisäämällä verkkokauppa- tai galleriasivuja tulevaisuudessa.

## Asennus

1. Varmista, että koneellesi on asennettu [Node.js](https://nodejs.org/).
2. Kopioi tämä hakemisto (esimerkiksi `ilojaloin-source`) omalle koneellesi.
3. Avaa pääte (terminal) projektin juurihakemistoon ja suorita:

   ```bash
   npm install
   ```

   Tämä lataa Reactin, Viten, Tailwindin ja muut tarvittavat riippuvuudet.

## Kehitysympäristö

Käynnistä paikallinen kehityspalvelin seuraavasti:

```bash
npm run dev
```

Vite käynnistää selaimessa sivun (oletuksena osoitteessa `http://localhost:5173`),
jossa voit seurata muutosten vaikutusta reaaliaikaisesti. Tee muutokset
`src`‑hakemiston tiedostoihin; selain päivittyy automaattisesti.

## Build ja julkaisu GitHub Pagesiin

Kun sivu on valmis, luo optimointi- ja tuotantoversio suorittamalla:

```bash
npm run build
```

Tämä luo `dist`‑hakemiston, jossa on valmiit HTML-, CSS- ja JS‑tiedostot.
Voit julkaista ne GitHub Pagesissa kopioimalla `dist`‑hakemiston sisällön
repositorysi päähaaraan ja asettamalla Pagesin lähteeksi `/(root)`.

> Huom: `vite.config.js` sisältää `base: './'` –asetuksen, jotta build
> käyttää suhteellisia polkuja, mikä helpottaa GitHub Pages ‑julkaisua.

## Julkaisu GitHubiin — huomioi tietosuoja

Ennen julkaisua julkiseen repositoryyn tarkista, että sivuston sisältö ei sisällä henkilötietoja tai sensitiivisiä tunnuksia, joita et halua julkistaa. Tarkista erityisesti:
- Puhelinnumerot, sähköpostiosoitteet ja yritystunnukset (Y‑tunnus) — poista tai anonymisoi tarvittaessa.
- Kolmansien osapuolten API-avaimet tai yksityiset tiedostot (ei tulisi olla repossa).
- Lomaketoiminnoissa käytetyt sähköpostiosoitteet ja webhook-osoitteet, jos ne ovat yksityisiä.

Julkaisu GitHub Pagesiin:
```bash
npm run build
# kopioi dist-kansion sisältö GitHub-repoon tai käytä sopivaa deployment-työkalua
```

## Mukautukset

* **Värit ja fontit:** Nämä on määritelty `tailwind.config.js` –tiedostossa.
  Voit muuttaa väriarvoja tai lisätä omia teemoja `theme.extend` –kohdan alle.
* **Fontit:** Google Fontit Poppins ja Open Sans ladataan `index.html` –tiedoston
  `<link>`‑elementissä. Voit vaihtaa fontteja `tailwind.config.js` –tiedoston
  `fontFamily`‑asetuksessa.
* **Ajanvaraus & kartta:** `src/App.jsx` sisältää iframe‑elementit Velloa
  varten ja Google Maps ‑upotusta varten. Korvaa `src`‑osoitteet omilla
  Vello‑linkeilläsi ja Google Maps API ‑avaimellasi.

## Lisätietoja

Tämä projekti ei sisällä `node_modules`‑hakemistoa, koska se syntyy
`npm install`‑komennolla. Vite ja Tailwind mahdollistavat modernin ja
responsiivisen sivuston rakentamisen, joka toimii sujuvasti GitHub Pagesilla.