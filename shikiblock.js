import { createHighlighter } from 'https://esm.sh/shiki@3';
import oneLight from 'https://esm.sh/shiki@3/themes/one-light.mjs';


var highlighter = null

class ShikiBlock extends HTMLElement {
  constructor() {
    super()
    this.source_code = this.textContent;  
    if (this.getAttribute("language")) {
      this.language_name = this.getAttribute("language");  
    } else {
      this.language_name = "javascript"
    }
  }
  async loadHighlighter(rootPath,languages) {
    // Load the Isabelle TextMate grammar
    const grammar = await fetch(rootPath + '/langs/Isabelle.tmLanguage.json').then(r => r.json());
    highlighter = await createHighlighter({
      themes: [oneLight], langs: languages
    });
    await highlighter.loadLanguage(grammar)
  }
  async connectedCallback() {    
    if (highlighter == null) {
      const languages = this.getAttribute("load-languages")
      const rootPath = this.getAttribute("root-path")
      await this.loadHighlighter(rootPath,languages.split(',').map(s => s.trim()))
    }
    this.innerHTML = await highlighter.codeToHtml(this.source_code, {
      lang: this.language_name,
      theme: 'one-light'
    })    
  }
}

window.customElements.define("shiki-block", ShikiBlock);
