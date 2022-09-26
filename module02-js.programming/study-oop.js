let Employee1 = function (identity, fullname, salary, iban) {
    let self = this;
    self.identity = identity;
    self.fullname = fullname;
    self.salary = salary;
    self.iban = iban;

    self.increaseSalary = function (rate = 10) {
        console.log(self)
        self.salary *= (1.0 + rate / 100);
    }

}

class Employee {
    constructor(identity, fullname, salary, iban) {
        this.identity = identity;
        this.fullname = fullname;
        this.salary = salary;
        this.iban = iban;
        // this.increaseSalary = this.increaseSalary.bind(this);
    }

    increaseSalary = (rate = 10) => { // arrow function/lambda expression
        console.log(this)
        this.salary *= (1.0 + rate / 100);
    }

}

let jack = new Employee("1", "jack bauer", 100000, "tr1");
jack.increaseSalary(); // this->jack
window.setInterval(jack.increaseSalary, 5000); // this->window

let anotherJack = {...jack};
let {identity, fullname} = {...jack};
let identity = jack.identity;
let fullname = jack.fullname;

let numbers = [4, 8, 15, 16, 23, 42];
let [first, second, ...rest] = [...numbers];

let evens = [2, 4, 6, 8];
let odds = [1, 3, 5, 7];
let sortedNumbers = [...evens, ...odds].sort((x, y) => y - x);
