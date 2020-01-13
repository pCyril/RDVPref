#!/usr/bin/env node

const { createWorker } = require('tesseract.js');
const worker = createWorker();

console.log('ici');

(async () => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize('captcha.png');
    console.log(text);
    await worker.terminate();
})();