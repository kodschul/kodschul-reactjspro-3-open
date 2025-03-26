// after x seconds

let timeoutId = setTimeout(() => {
  console.log("Time is up!: ", new Date());
}, 5000);

let x = 0;

let intervalId = setInterval(() => {
  if (x >= 2) {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
  }

  x++;
}, 1000);

// every x seconds

// let ticks = 0;

// let timerId = setInterval(() => {
//   console.log("Timer is running: ", new Date());

//   if (ticks >= 5) {
//     clearInterval(timerId);
//   }

//   ticks += 1;
// }, 1000);

// // clearInterval(timerId);
