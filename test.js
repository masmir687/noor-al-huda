const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('quran.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/quran.html" });

const quranJs = fs.readFileSync('js/quran.js', 'utf8');
const script = dom.window.document.createElement('script');
script.textContent = quranJs;

dom.window.document.head.appendChild(script);

setTimeout(() => {
    console.log('Script ran. Errors?');
}, 1000);
