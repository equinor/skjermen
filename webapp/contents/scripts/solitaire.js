var _a = [window.innerWidth, window.innerHeight],WIDTH = _a[0],HEIGHT = _a[1], // px, px
_b = [71, 96],CARD_WIDTH = _b[0],CARD_HEIGHT = _b[1], // px, px
SECS_PER_FRAME = 9, // sec/frame
GRAVITY = 9, // pixels/sec^2
DAMPENING = 0.8;
var Rank;
(function (Rank) {
  Rank[Rank["Ace"] = 0] = "Ace";
  Rank[Rank["Two"] = 1] = "Two";
  Rank[Rank["Three"] = 2] = "Three";
  Rank[Rank["Four"] = 3] = "Four";
  Rank[Rank["Five"] = 4] = "Five";
  Rank[Rank["Six"] = 5] = "Six";
  Rank[Rank["Seven"] = 6] = "Seven";
  Rank[Rank["Eight"] = 7] = "Eight";
  Rank[Rank["Nine"] = 8] = "Nine";
  Rank[Rank["Ten"] = 9] = "Ten";
  Rank[Rank["Jack"] = 10] = "Jack";
  Rank[Rank["Queen"] = 11] = "Queen";
  Rank[Rank["King"] = 12] = "King";
})(Rank || (Rank = {}));
var Suit;
(function (Suit) {
  Suit[Suit["Spades"] = 0] = "Spades";
  Suit[Suit["Diamonds"] = 1] = "Diamonds";
  Suit[Suit["Clubs"] = 2] = "Clubs";
  Suit[Suit["Hearts"] = 3] = "Hearts";
})(Suit || (Suit = {}));
// Getting all values of an Enum is as pleasant as stepping on legos
function enumValues(e) {
  return Object.keys(e).map(function (v) {return parseInt(v);}).filter(function (v) {return !isNaN(v);});
}
// Fisher-Yates Shuffle
function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    _a = [arr[j], arr[i]], arr[i] = _a[0], arr[j] = _a[1];
  }
  var _a;
}
var Cards = /** @class */function () {
  function Cards(ctx, image) {
    this._ctx = ctx;
    this._image = image;
    this._imageWidth = image.width;
    this._imageHeight = image.height;
  }
  Cards.prototype.makeFoundations = function () {
    var _this = this;
    var cards = [];
    var _loop_1 = function () {
      var offsetY = rank / 4 | 0 + 20;
      var offsetX = offsetY * 2;
      var cardsOfRank = enumValues(Suit).map(function (s) {
        var x = window.innerWidth - (CARD_WIDTH + 10) * (4 - s) - 100;
        return new Card(_this, s, rank, x + offsetX, 5 + offsetY);
      });
      shuffle(cardsOfRank);
      cards.push.apply(cards, cardsOfRank);
    };
    for (var _i = 0, _a = enumValues(Rank); _i < _a.length; _i++) {
      rank = _a[_i];
      _loop_1();
    }
    return cards;
  };
  Cards.prototype.draw = function (_a, dx, dy) {
    var suit = _a[0],rank = _a[1];
    var sx = (suit * 13 + rank + 1) * CARD_WIDTH;
    this.drawCardAt(sx, dx, dy);
  };
  Cards.prototype.drawPlaceholder = function (dx, dy) {
    this.drawCardAt(0, dx, dy);
  };
  Cards.prototype.drawCardAt = function (sx, dx, dy) {
    this._ctx.drawImage(this._image, sx, 0, CARD_WIDTH, CARD_HEIGHT, dx, dy, CARD_WIDTH, CARD_HEIGHT);
  };
  return Cards;
}();
var Card = /** @class */function () {
  function Card(drawer, suit, rank, x, y) {
    this._drawer = drawer;
    this.suit = suit;
    this.rank = rank;
    this.x = x;
    this.y = y;
  }
  Card.prototype.draw = function () {
    this._drawer.draw([this.suit, this.rank], this.x, this.y);
  };
  Card.prototype.isOffscreen = function () {
    return this.x <= -CARD_WIDTH || this.x > WIDTH;
  };
  return Card;
}();
var CardAnimation = /** @class */function () {
  function CardAnimation(card, dx, dy) {
    this.card = card;
    this.dx = dx;
    this.dy = dy;
  }
  CardAnimation.makeRandom = function (card) {
    // Randomly choose dx in [-5, -3] u [1, 3]
    var dx = Math.round(Math.random() * 4 - 2);
    dx += dx > 0 ? 1 : -3;
    // Randomly choose dy in [-10, 0]
    var dy = Math.round(Math.random() * -10);
    return new CardAnimation(card, dx, dy);
  };
  /**
      * Take a step of animation (frame).
      * @returns true if the card's animation is done, false otherwise
      */
  CardAnimation.prototype.step = function () {
    // Return false to indicate that the card should no longer be animated
    if (this.card.isOffscreen()) {
      return false;
    }
    // Update card position with velocity
    this.card.x += this.dx;
    this.card.y += this.dy;
    // If we've hit (or passed) the floor, bounce
    if (this.card.y + CARD_HEIGHT >= HEIGHT) {
      this.dy *= -DAMPENING;
      // Prevent card from getting stuck below the floor (which very
      // quickly dampens dy to 0)
      this.card.y = HEIGHT - CARD_HEIGHT;
    } else
    {
      // Otherwise, apply gravity
      this.dy += GRAVITY / SECS_PER_FRAME;
    }
    this.card.draw();
    // The card moved in this frame, so we may have more to animate
    return true;
  };
  return CardAnimation;
}();
/**
      * Represents the composite animation of all 52 cards.
      */
var Animation = /** @class */function () {
  function Animation(remainingCards) {
    this._remainingCards = remainingCards;
    this._remainder = 0;
  }
  /**
     * Update the individual card animations one at a time (frame by frame)
     * until complete (or there isn't enough delta left to proceed to the
     * next frame). Keeps track of remainder delta for next call to update.
     *.
     * @returns true if there still are cards to animate
     */
  Animation.prototype.update = function (delta) {
    // Include sub SEC_PER_FRAME time from last update
    delta += this._remainder;
    while (this._remainingCards.length > 0 && delta >= SECS_PER_FRAME) {
      var card = this._remainingCards[this._remainingCards.length - 1];
      if (!card.step()) {
        // When cards don't animate, they are offscreen. So, we can
        // proceed to animating the next card
        this._remainingCards.pop();
      } else
      {
        // We discretize the delta into frames of length SEC_PER_FRAME
        delta -= SECS_PER_FRAME;
      }
    }
    // Keep track of any leftover time for the next update
    this._remainder = delta;
    return this._remainingCards.length > 0;
  };
  return Animation;
}();
/**
      * @param ctx   Game canvas 2d context
      * @param cards The cards spritemap
      * @param deck  The 52 cards in rank order (already positioned in the
      *              foundation stacks--A to K in stacks of Spades, Diamonds,
      *              Clubs, Hearts)
      */
function drawInitialState(ctx, cards, deck) {
  // Background
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw stacked winning foundation (deck is sorted from aces
  // to kings so the draw order is correct for the stacks)
  deck.map(function (c) {return c.draw();});
}
/**
   * Starts the card bounce winning animation.
   * @param deck An array of cards in the order that they will be animated
   */
function startAnimation(deck) {
  // Create random animations for all 52 cards
  var cardAnimations = deck.map(function (c) {return CardAnimation.makeRandom(c);}),animation = new Animation(cardAnimations);
  // Start updating the animation
  var last = null;
  window.requestAnimationFrame(function update(now) {
    var delta = now - (last == null ? now : last);
    last = now;
    // Continue animating if there are cards left
    if (animation.update(delta)) {
      window.requestAnimationFrame(update);
    }
  });
}

function runSolitaire() {
  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('canvas'),ctx = canvas.getContext('2d'),cards = document.getElementById('cards'); // cards spritemap
    // Setup canvas
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  // Original art is very pixel-y
  ctx.imageSmoothingEnabled = false;
  // Create deck:
  // Deck is sorted by rank, but within rank the suits are randomly
  // shuffled (so we can animated them in that order and get different
  // suit orderings for each rank)
  var cards = new Cards(ctx, cards),deck = cards.makeFoundations();
  drawInitialState(ctx, cards, deck);
    startAnimation(deck);
  });
}
