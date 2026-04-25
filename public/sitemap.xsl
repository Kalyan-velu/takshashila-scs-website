<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">

    <xsl:output method="html" encoding="UTF-8" indent="yes"/>

    <xsl:template match="/">
        <html>
            <head>
                <title>Sitemap</title>
                <style>
                    body { font-family: sans-serif; padding: 2rem; }
                    table { width: 100%; border-collapse: collapse; }
                    td, th { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
                    th { background: #f4f4f4; }
                    a { color: #0070f3; }
                </style>
            </head>
            <body>
                <h1>Sitemap</h1>
                <table>
                    <tr><th>URL</th><th>Last Modified</th></tr>
                    <xsl:for-each select="sm:urlset/sm:url">
                        <tr>
                            <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
                            <td><xsl:value-of select="sm:lastmod"/></td>
                        </tr>
                    </xsl:for-each>
                </table>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>