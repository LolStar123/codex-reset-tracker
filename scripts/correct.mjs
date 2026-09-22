import fs from 'node:fs';
import path from 'node:path';
const [id,category,...reason]=process.argv.slice(2);
if(!/^\d+$/.test(id??'')||!['confirmed','scheduled','hint','clarification','correction','hidden'].includes(category)||!reason.length) {
    console.error('Usage: node scripts/correct.mjs POST_ID CATEGORY REASON');process.exit(1);
}
const file=path.resolve('data/overrides.json');const data=JSON.parse(fs.readFileSync(file,'utf8'));
data[id]={category,reason:reason.join(' ')};
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log('Correction recorded. Validate and publish to apply it to the hosted monitor.');
