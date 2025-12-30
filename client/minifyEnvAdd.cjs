const fs = require('fs');
const path = require('path');
const clipboardy = require('clipboardy');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const varName = 'VITE_REQUIREMENT_ADDITIONS';
let collecting = false;
let value = '';

envContent.split('\n').forEach((line) => {
  if (line.startsWith(varName + '=')) {
    collecting = true;
    value = line.substring(varName.length + 1);
  } else if (collecting) {
    // Stop if another variable starts
    if (/^[A-Z0-9_]+=/.test(line)) {
      collecting = false;
    } else {
      value += '\n' + line;
    }
  }
});

function copyToClipboard(text) {
  if (typeof clipboardy.writeSync === 'function') {
    clipboardy.writeSync(text);
    console.log('Copied to clipboard!');
  } else if (clipboardy.default && typeof clipboardy.default.writeSync === 'function') {
    clipboardy.default.writeSync(text);
    console.log('Copied to clipboard!');
  } else {
    console.log('Could not copy to clipboard automatically. Here is the result:');
    console.log(text);
  }
}

try {
  const cleaned = value.trim().replace(/^['"]|['"]$/g, '');
  const minified = JSON.stringify(JSON.parse(cleaned));
  copyToClipboard(minified);
} catch (e) {
  copyToClipboard(value.trim());
}
