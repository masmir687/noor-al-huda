const fs = require('fs');

const meta = fs.readFileSync('data/bukhari_meta.json', 'utf8');
fs.writeFileSync('data/bukhari_meta.js', `const BUKHARI_META = ${meta};`);
fs.unlinkSync('data/bukhari_meta.json');

for (let i = 1; i <= 97; i++) {
    if (fs.existsSync(`data/bukhari_${i}.json`)) {
        const data = fs.readFileSync(`data/bukhari_${i}.json`, 'utf8');
        fs.writeFileSync(`data/bukhari_${i}.js`, `const BUKHARI_${i} = ${data};`);
        fs.unlinkSync(`data/bukhari_${i}.json`);
    }
}
console.log('Converted Bukhari JSON files to JS for local file:// support.');