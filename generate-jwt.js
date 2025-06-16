const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Inputs — replace with your actual data
const method = 'GET'; // or POST, PUT etc.
const apiPath = '/public/rest/api/2.0/teststep/358408'; // only path, not full URL
const baseURL = 'https://prod-api.zephyr4jiracloud.com/connect';
const accessKey =
  'amlyYTphNTY2ODhjMy1lMDhlLTQ1N2EtYjhiZC03ZWVjYTFmMWQ3YTAgNzEyMDIwJTNBODFkMTE0YWQtNmUzOS00MmU3LWIyZDctZmEyYjQxYTJjOTllIFVTRVJfREVGQVVMVF9OQU1F';
const secretKey = 'ToqK9FhYyZCutoZPRJYBH1wr2A-5cMmWJSNxP32-BrE';
const accountId = '712020:81d114ad-6e39-42e7-b2d7-fa2b41a2c99e';

const queryParams = 'projectId=17058';

function generateJWT() {
  const canonicalRequest = `${method}&${apiPath}&${queryParams}`;
  const qsh = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const payload = {
    sub: accountId,
    qsh: qsh,
    iss: accessKey,
    exp: Math.floor(Date.now() / 1000) + 360, // 6 mins
  };

  const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
  console.log('JWT ', token);
}

generateJWT();
