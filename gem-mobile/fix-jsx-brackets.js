const fs = require('fs');
const path = require('path');

// Pattern to find: />  followed by  )}  followed by  < on different lines
// This is broken JSX where )} is in the wrong place

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Pattern 1: Icon/Component />  followed by )}  followed by <Text or other element
  // This pattern finds: /> \n )} \n <Something
  const pattern1 = /(\s*\/>\s*)\n(\s*\)\}\s*)\n(\s*<(?!\/)[A-Z])/g;
  
  if (pattern1.test(content)) {
    content = content.replace(pattern1, '$1\n$3');
    changed = true;
  }
  
  // Pattern 2: </Tag> followed by )} followed by </ParentTag>
  // This needs )} AFTER </ParentTag>, not before
  // But we need to be careful - sometimes )} is legitimate
  
  // Pattern 3: />  \n  )}  \n  </View  (or other closing tag)
  // The )} should come AFTER </View>
  const pattern3 = /(\s*\/>\s*)\n(\s*\)\}\s*)\n(\s*<\/)/g;
  
  if (pattern3.test(content)) {
    // Move )} after the closing tag
    content = content.replace(pattern3, '$1\n$3');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed:', filePath);
    return true;
  }
  return false;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const filePath = path.join(dir, f);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules')) {
        walkDir(filePath, callback);
      }
    } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
      callback(filePath);
    }
  });
}

let fixedCount = 0;
walkDir('./src', (filePath) => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

console.log(`Total files fixed: ${fixedCount}`);
