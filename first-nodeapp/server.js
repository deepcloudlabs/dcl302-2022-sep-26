const http = require('http');
const port = 7200;

async function getAsyncNumbers(max = 60, size = 6) {
    let numbers = [];
    while (numbers.length < size) {
        let randomNumber = Math.floor(Math.random() * max + 1);
        if (numbers.includes(randomNumber)) continue;
        numbers.push(randomNumber);
    }
    numbers.sort((x, y) => x - y);
    return numbers;
}

http.createServer(async (req,res) => {
   res.writeHead(200);
   getAsyncNumbers(60,6).then( numbers => res.end(JSON.stringify(numbers)));
}).listen(port);

console.log(`Listening on port ${port}...`);