customers = [
    {identity: "1", fullname: "jack bauer", birthYear: 1956, city: "ankara"},
    {identity: "2", fullname: "kate austen", birthYear: 1984, city: "istanbul"},
    {identity: "3", fullname: "james sawyer", birthYear: 1972, city: "ankara"},
    {identity: "4", fullname: "ben linus", birthYear: 1959, city: "izmir"},
    {identity: "5", fullname: "kin kwon", birthYear: 1988, city: "izmir"},
    {identity: "5", fullname: "sun kwon", birthYear: 1989, city: "izmir"}
];

function birthYearLargerThan1980(customer) {
    console.log(`birthYearLargerThan1980(${customer.fullname})`);
    return customer.birthYear > 1980;
}

function cityIsIzmir(customer) {
    console.log(`cityIsIzmir(${customer.fullname})`);
    return customer.city === "izmir";
}

let filter = function* (dizi, predFun) { // generator function!
    for (let elem of dizi) {
        if (predFun(elem))
            yield elem;
    }
};

// pipeline!
for (let cust of filter(filter(customers, birthYearLargerThan1980), cityIsIzmir)) {
    console.log(`One customer found: ${cust.fullname}`);
}