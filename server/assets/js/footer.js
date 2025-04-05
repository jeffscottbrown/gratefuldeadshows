const phrases = [
  "Once in a while you get shown the light in the strangest of places if you look at it right.",
	"Sometimes the light's all shining on me, other times I can barely see.",
	"Without love in the dream, it will never come true.",
	"Strangers stopping strangers just to shake their hand.",
	"Nothing left to do but smile, smile, smile.",
	"Every silver lining's got a touch of grey.",
	"Wake up to find out that you are the eyes of the world.",
	"Let there be songs to fill the air.",
	"Ripple in still water, when there is no pebble tossed, nor wind to blow.",
	"Once in a while you get shown the light in the strangest of places if you look at it right.",
	"Sometimes we live no particular way but our own.",
	"Such a long, long time to be gone, and a short time to be there.",
	"Shall we go, you and I while we can?",
	"Fare you well, fare you well, I love you more than words can tell.",
	"Come hear Uncle John's Band by the riverside.",
	"Don't tell me this town ain't got no heart.",
	"Light the song with sense and color, hold away despair.",
	"Reach out your hand if your cup be empty.",
	"Let there be songs to fill the air.",
	"Once in a while you get shown the light in the strangest of places if you look at it right.",
	"What a long, strange trip it's been.",
	"Sugar magnolia, blossoms blooming, heads all empty and I don't care.",
	"Sometimes the songs that we hear are just songs of our own.",
	"But the heat came round and busted me for smiling on a cloudy day.",
  ];

  function updateFooterMessage() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const message = phrases[randomIndex];
    document.getElementById('footermessage').textContent = message;
  }
