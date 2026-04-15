/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const { getWelcomeEmailHtml } = require('./backend/utils/emailTemplates');

const html = getWelcomeEmailHtml({ name: 'John Doe' });
fs.writeFileSync('./email-preview.html', html);
console.log('Successfully generated email-preview.html');
