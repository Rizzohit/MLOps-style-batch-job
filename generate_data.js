const fs = require('fs');

function generateData(n = 10000) {
  const header = 'timestamp,open,high,low,close,volume\n';
  let content = header;
  let close = 100;
  
  const now = new Date('2023-01-01T00:00:00Z');

  for (let i = 0; i < n; i++) {
    const timestamp = new Date(now.getTime() + i * 60000).toISOString();
    const change = (Math.random() - 0.5) * 0.2;
    close += change;
    const open = close + (Math.random() - 0.5) * 0.1;
    const high = Math.max(open, close) + Math.random() * 0.1;
    const low = Math.min(open, close) - Math.random() * 0.1;
    const volume = Math.floor(Math.random() * 900) + 100;
    
    content += `${timestamp},${open.toFixed(4)},${high.toFixed(4)},${low.toFixed(4)},${close.toFixed(4)},${volume}\n`;
    
    // Write in chunks to avoid memory issues if n is very large, 
    // but for 10k rows it should be fine.
    if (i % 1000 === 0 && i > 0) {
        fs.appendFileSync('data.csv', content);
        content = '';
    }
  }
  fs.appendFileSync('data.csv', content);
  console.log('Generated data.csv with 10,000 rows.');
}

if (fs.existsSync('data.csv')) {
    fs.unlinkSync('data.csv');
}
generateData();
