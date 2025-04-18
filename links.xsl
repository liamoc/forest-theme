<?xml version="1.0"?>
<!-- SPDX-License-Identifier: CC0-1.0 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:f="http://www.forester-notes.org">

  <!-- The purpose of this module is to perform flattening of nested links. -->
  <xsl:template match="f:link">
    <span class="link {@type}">
      <xsl:apply-templates mode="link-flattening" />
    </span>
  </xsl:template>

  <xsl:template match="f:link//node()[not(f:link)]" mode="link-flattening">
    <a href="{ancestor::f:link[1]/@href}">
      <xsl:choose>
        <xsl:when test="ancestor::f:link[1]/@uri">
          <xsl:attribute name="title">
            <xsl:value-of select="ancestor::f:link[1]/@title" />
            <xsl:text> [</xsl:text>
            <xsl:value-of
              select="ancestor::f:link[1]/@uri" />
            <xsl:text>]</xsl:text>
          </xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="title">
            <xsl:value-of select="ancestor::f:link[1]/@title" />
          </xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="." />
    </a>
  </xsl:template>

</xsl:stylesheet>
