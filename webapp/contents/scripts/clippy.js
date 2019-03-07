let clippyInterval = 10000;

function randomInArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let quotes = [
  '"Beware of bugs in the above code; I have only proved it correct, not tried it" - Donald Knuth',
  "These aren't the droids you're looking for.",
  "Heisveis!"
];

clippy.load('Clippy', function (agent) {
  agent.show();

  agent.animate();
  window.agent = agent;

  let moveRandom = function () {
    let margin = 100;
    let width = window.innerWidth - margin * 2;
    let height = window.innerHeight - margin * 2;
    let x = Math.floor(margin + Math.random() * width);
    let y = Math.floor(margin + Math.random() * height);
    agent.moveTo(x, y);
  };
  let randomAnimate = function () {
    agent.animate();
  };

  let tickerTexts = $(".ticker-item").map(function () {
    return this.textContent
  }).filter(function () {
    return this.length !== 0
  }).toArray();

  let speakRandomText = function () {
    agent.speak(randomInArray(tickerTexts.concat(quotes)));
  };

  let actions = [
    randomAnimate,
    moveRandom,
    speakRandomText
  ];

  function doSomething() {
    randomInArray(actions)();
  }

  window.setInterval(doSomething, clippyInterval);
});
