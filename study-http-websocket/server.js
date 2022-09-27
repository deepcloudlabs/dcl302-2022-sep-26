const fetch = require("node-fetch");
const restApiUrl = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
setInterval(() => {
    fetch(restApiUrl).then(res => res.json())
                     .then( console.log );
}, 3000);

const websocket = require('ws');
const restWsUrl = "wss://stream.binance.com:9443/ws/btcusdt@trade";
const ws = new websocket(restWsUrl);
ws.on('message', frame => {
   const trade = JSON.parse(frame);
   console.log(trade);
});

/* trade event:
{
  e: 'trade',
  E: 1664268944349,
  s: 'BTCUSDT',
  t: 1886011740,
  p: '20156.05000000',
  q: '0.00159000',
  b: 13879949875,
  a: 13879949868,
  T: 1664268944348,
  m: false,
  M: true
}
 */


