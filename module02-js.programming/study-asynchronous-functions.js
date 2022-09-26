function getSyncRandomNumbers(max = 60, size = 6) {
    let numbers = [];
    while (numbers.length < size) {
        let randomNumber = Math.floor(Math.random() * max + 1);
        if (numbers.includes(randomNumber)) continue;
        numbers.push(randomNumber);
    }
    numbers.sort((x, y) => x - y);
    return numbers;
}

function getAsyncRandomNumbers(max = 60, size = 6) {
    return new Promise((accept, reject) => {
        if (size > max) reject("max must be larger than size.");
        let numbers = [];
        while (numbers.length < size) {
            let randomNumber = Math.floor(Math.random() * max + 1);
            if (numbers.includes(randomNumber)) continue;
            numbers.push(randomNumber);
        }
        numbers.sort((x, y) => x - y);
        setTimeout(() => accept(numbers), 10000);
    });
}

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


let numbers = getSyncRandomNumbers(60, 6);
console.log(numbers);
getAsyncRandomNumbers(60, 6).then(console.log)
    .catch(console.error);

getAsyncNumbers(60, 6).then(console.log)
    .catch(console.error);

let isEven = async (num) => num % 2 === 0;

let gun = async () => {
    let myRandomNumbers = await getAsyncNumbers(60, 6);
}
