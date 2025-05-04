const phrases = [
	"But the heat came round and busted me for smiling on a cloudy day.",
	"Come hear Uncle John's Band by the riverside.",
	"Don't tell me this town ain't got no heart.",
	"Every silver lining's got a touch of grey.",
	"Fare you well, fare you well, I love you more than words can tell.",
	"Let there be songs to fill the air.",
	"Light the song with sense and color, hold away despair.",
	"Nothing left to do but smile, smile, smile.",
	"Once in a while you get shown the light in the strangest of places if you look at it right.",
	"Reach out your hand if your cup be empty.",
	"Ripple in still water, when there is no pebble tossed, nor wind to blow.",
	"Shall we go, you and I while we can?",
	"Sometimes the light's all shining on me, other times I can barely see.",
	"Sometimes the songs that we hear are just songs of our own.",
	"Sometimes we live no particular way but our own.",
	"Strangers stopping strangers just to shake their hand.",
	"Such a long, long time to be gone, and a short time to be there.",
	"Sugar magnolia, blossoms blooming, heads all empty and I don't care.",
	"Wake up to find out that you are the eyes of the world.",
	"What a long, strange trip it's been.",
	"Without love in the dream, it will never come true.",
  ];

  function updateFooterMessage() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const message = phrases[randomIndex];
    document.getElementById('footermessage').textContent = message;
  }
