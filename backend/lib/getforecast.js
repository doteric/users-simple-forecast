const CryptoJS = require("crypto-js");
const param = require('jquery-param');
const fetch = require("node-fetch");

require('dotenv').config();
if (process.env.ENV_OK !== "yes") {
  throw new Error('The .env file is not included.');
}

async function getForecast(location) {
  const url = 'https://weather-ydn-yql.media.yahoo.com/forecastrss';
  const method = 'GET';
  const app_id = process.env.YAHOO_APPID;
  const consumer_key = process.env.YAHOO_CONSUMER_KEY;
  const consumer_secret = process.env.YAHOO_CONSUMER_SECRET;
  const concat = '&';
  const query = {
    'location': location,
    'format': 'json'
  };
  const oauth = {
    'oauth_consumer_key': consumer_key,
    'oauth_nonce': Math.random().toString(36).substring(2),
    'oauth_signature_method': 'HMAC-SHA1',
    'oauth_timestamp': parseInt(new Date().getTime() / 1000).toString(),
    'oauth_version': '1.0'
  };

  const merged = {...query, ...oauth};
  const merged_arr = Object.keys(merged).sort().map(function(k) {
    return [k + '=' + encodeURIComponent(merged[k])];
  });
  const signature_base_str = method
  + concat + encodeURIComponent(url)
  + concat + encodeURIComponent(merged_arr.join(concat));

  const composite_key = encodeURIComponent(consumer_secret) + concat;
  const hash = CryptoJS.HmacSHA1(signature_base_str, composite_key);
  const signature = hash.toString(CryptoJS.enc.Base64);

  oauth['oauth_signature'] = signature;
  const auth_header = 'OAuth ' + Object.keys(oauth).map(function(k) {
    return [k + '="' + oauth[k] + '"'];
  }).join(',');

  const response = await fetch(url+'?'+param(query), {
    headers: {
      'Authorization': auth_header,
      'X-Yahoo-App-Id': app_id 
    },
    method: 'GET',
  });
  const data = await response.json();
  return data;
}

export default getForecast;