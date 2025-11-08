<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap - Ilojaloin</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          h1 { color: #d4a574; }
          table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #d4a574; color: white; font-weight: bold; }
          tr:hover { background: #f9f9f9; }
          a { color: #2A6FD3; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .info { background: white; padding: 15px; margin-bottom: 20px; border-left: 4px solid #d4a574; }
        </style>
      </head>
      <body>
        <div class="info">
          <h1>Ilojaloin Sitemap</h1>
          <p>Tämä on XML-sivukartta, joka on tarkoitettu hakukoneille kuten Googlelle. Sivustolla on yhteensä <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> sivua.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Viimeksi päivitetty</th>
              <th>Päivitystiheys</th>
              <th>Prioriteetti</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td>
                  <a href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                </td>
                <td><xsl:value-of select="sitemap:lastmod"/></td>
                <td><xsl:value-of select="sitemap:changefreq"/></td>
                <td><xsl:value-of select="sitemap:priority"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
