

// import spacetime from 'spacetime'
// const timezoneStr = '08:00:00'
// const dateStr = '2017-04-03'


// if (timezoneStr == null) {
//     console.log(`Timezone string must be specified!`);
// }

// if (dateStr == null) {
//     const s = spacetime(`${year}-${month}-${date}T${timezoneStr}`)
//     const epochTimestamp = s['epoch']
//     console.log(`The current time is <t:${epochTimestamp}:t>`);
// }
// else {
//     const s = spacetime(`2025-01-01T${timezoneStr}`)
//     const epochTimestamp = s['epoch']
//     console.log(`The current time is <t:${epochTimestamp}>`);
// }

const assert = require('assert')

n = 100
try {
    assert(2 <= n <= 2 ** 20)
}
catch (exception) {
    console.log('no')
}

// generate the flag list
var flagArr = [1] * n;
console.log(flagArr)

// for (var i = 1; i <= n; i++) {
//     flagArr.push(i);
// }

var i = 2
while (i ** 2 <= n) {
    for (var j = 2; j <= n / i; j++) {
        // Multiples of 2 cannot be prime
        flagArr[j * i] = 0;
    }

    do {
        i += 1;
    } while (flagArr[i] != 1);
}

var result = ''

for (var i = 1; i <= n; i++) {
    if (flagArr[i] == 1) {
        result += String(i);
        result += ' '
    }
}        

console.log(result)