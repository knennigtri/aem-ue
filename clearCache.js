// Make sure to run this commands in the terminal:
// npm install --save-dev dotenv axios
// add a .env file with the content: HLX_AUTH_TOKEN=your-auth-token
// Add an npm script in package.json:
// "clear-cache": "node clearCache.js"
// Then run the script using: npm run clear-cache

require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    const response = await axios.post(
      'https://admin.hlx.page/cache/knennigtri/aem-edge-getting-started/main/*',
      null,
      {
        headers: {
          'User-Agent': 'insomnia/10.1.1-adobe',
          'x-hlx-auth': process.env.AEM_AUTH_TOKEN,
        },
      },
    );
    console.log('✅ Cache cleared:', response.data);
  } catch (err) {
    console.error('❌ Failed to clear cache:', err.response?.data || err.message);
    process.exit(1);
  }
})();
