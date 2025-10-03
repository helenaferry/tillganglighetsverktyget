const fs = require('fs');
const path = require('path');
const clipboardy = require('clipboardy');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const varName = 'VITE_PREFILL_REQUIREMENTS';
let collecting = false;
let value = '';

envContent.split('\n').forEach((line) => {
  if (line.startsWith(varName + '=')) {
    collecting = true;
    value = line.substring(varName.length + 1);
  } else if (collecting) {
    if (/^[A-Z0-9_]+=/.test(line)) {
      collecting = false;
    } else {
      value += '\n' + line;
    }
  }
});

// Try different clipboardy APIs
function copyToClipboard(text) {
  if (typeof clipboardy.writeSync === 'function') {
    clipboardy.writeSync(text);
  } else if (clipboardy.default && typeof clipboardy.default.writeSync === 'function') {
    clipboardy.default.writeSync(text);
  } else {
    console.log('Could not copy to clipboard automatically. Here is the result:');
    console.log(text);
    return;
  }
  console.log('Copied to clipboard!');
}

try {
  const cleaned = value.trim().replace(/^['"]|['"]$/g, '');
  const minified = JSON.stringify(JSON.parse(cleaned));
  copyToClipboard(minified);
} catch (e) {
  copyToClipboard(value.trim());
}
