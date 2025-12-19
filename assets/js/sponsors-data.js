const sponsorsData = [
  {
    id: 1,
    name: "XMEME",
    slug: "xmeme",
    category: ["Memecoin", "NFT"],
    lead: "STONE",
    logo: "xmeme.png",
    x: "https://x.com/xmemecoinxrpl",
    website: "https://xmemecoinxrpl.com",
    telegram: "https://t.me/XMEMEonXRPL",
    description: "The Ultimate Shape-Shifting MEME. A living symbol of adaptability and creativity on the XRPL. It begins as a cube—simple, intuitive, versatile—then shape-shifts into whatever you need. Playful, powerful, and unlike anything else in the memecoin space.",
    featured: true
  },
  {
    id: 2,
    name: "$BANANA",
    slug: "banana",
    category: ["Memecoin", "NFT"],
    logo: "banana.png",
    x: "https://x.com/bananaXRPL",
    website: "https://BananaXRP.com",
    firstLedger: "https://firstledger.net/token-v2/rPopnAhPWZXiWApiPM5EHQ6ksLEhvGiLqP/42414E414E410000000000000000000000000000",
    description: "The smoothest memecoin on XRPL. Going bananas for the community with NFT utility and pure tropical vibes.",
    featured: true
  },
  {
    id: 3,
    name: "Keda's Brew",
    slug: "kedas-brew",
    category: ["Business"],
    owner: "Keda",
    logo: "kedas-brew.png",
    ownerX: "https://x.com/LivingBestLife9",
    website: "https://kedasbrew.com",
    description: "Say Goodbye to Harsh Skincare. Pure whipped beef tallow balm from 100% grass-fed cattle, hand-blended in small batches with organic oils. Crafted for everyday skin moisturizing.",
    featured: false
  },
  {
    id: 4,
    name: "Web3/Place",
    slug: "web3place",
    category: ["NFT"],
    logo: "web3place.png",
    x: "https://x.com/Web3SlashPlace",
    website: "https://linktr.ee/Web3SlashPlace",
    discord: "https://discord.com/invite/CtQhewsagQ",
    nftCollection: "https://xrp.cafe/collection/placers",
    description: "A Canvas to leave your mark in Web3 History. Placers NFTs & DAO on the XRPL. Canvas 2 coming soon.",
    featured: true
  },
  {
    id: 5,
    name: "Freedom Phoenix",
    slug: "freedom-phoenix",
    category: ["Memecoin", "NFT"],
    ticker: "$FTP / $ODC",
    logo: "freedom-phoenix.png",
    x: "https://x.com/FreedomPhoenixT",
    website: "https://freedompheonix.xyz",
    discord: "https://discord.gg/4wrQkhYP4g",
    description: "Start your journey to financial freedom with Freedom Phoenix utility NFTs. Daily rewards of $ODC and $FPT. Compound rewards through AMM pools. LETS GET FREE WITH THE ODYSSEY!",
    featured: true
  },
  {
    id: 6,
    name: "$NUTS",
    slug: "nuts",
    category: ["Memecoin", "NFT", "Gaming"],
    lead: "XRP Squirrel",
    logo: "nuts.png",
    x: "https://x.com/SquirrelXrp",
    website: "https://xrpsquirrel.com",
    firstLedger: "https://firstledger.net/token/rBpdegD7kqHdczjKzTKNEUZj1Fg1eYZRbe/4E75747300000000000000000000000000000000",
    description: "PICK WINNERS. WIN $NUTS. HOLD NFTs. GET PAID. Join the $NUTS sports contest hub—powered by XRP and your collectible NFTs.",
    featured: true
  },
  {
    id: 7,
    name: "BURN XRP",
    slug: "burn-xrp",
    category: ["Memecoin", "NFT"],
    ticker: "$BURN",
    logo: "burn-xrp.png",
    x: "https://x.com/BurnXrp28366",
    website: "https://xrpburn.com",
    telegram: "https://t.me/+s9KdUoHoEmcyZGQ5",
    nftCollection: "https://xrp.cafe/collection/burn-589-protocol",
    description: "A deflationary force on the XRP Ledger—engineered to vanish supply and reward conviction. Over 96% burned. When everything collapses, $BURN remains. Scarcity isn't a feature, it's the future.",
    featured: true
  },
  {
    id: 8,
    name: "DogMan XRP",
    slug: "dogman-xrp",
    category: ["Memecoin", "NFT"],
    lead: "BarkerMan",
    logo: "dogman-xrp.png",
    x: "https://x.com/DogmanXRPL",
    website: "https://dogmanxrp.com",
    description: "What if the XRPL was alive? What if it made a monster? What if he's still out there… watching? Lurking between code and shadow. Who is Dogman? Dare to find out.",
    featured: false
  },
  {
    id: 9,
    name: "SchwepeXRP",
    slug: "schwepe-xrp",
    category: ["Memecoin", "NFT"],
    ticker: "$SCHWEPE",
    lead: "Kang",
    logo: "schwepe-xrp.png",
    x: "https://x.com/CTO_SchwepeXRP",
    website: "https://schwepe.online/",
    telegram: "https://t.me/SchwepeCTO",
    description: "It's simple... David Schwartz x Pepe. The memecoin that brings legendary XRPL vibes together.",
    featured: false
  },
  {
    id: 10,
    name: "Dale Forward",
    slug: "dale-forward",
    category: ["Artist"],
    logo: "dale-forward.png",
    x: "https://x.com/dfart2287",
    website: "https://DaleForward.com",
    linktree: "https://linktr.ee/DaleForward",
    description: "NFT Artist on XRPL. Creating unique digital art that pushes boundaries and captures imagination.",
    featured: false
  },
  {
    id: 11,
    name: "Wandering Footprint",
    slug: "wandering-footprint",
    category: ["Community"],
    owner: "Optimystic Prime",
    logo: "wandering-footprint.png",
    x: "https://x.com/Wanderingprint",
    website: "https://wanderingfootprint.org",
    description: "The Wandering hOMe Directory brings resources together to inspire wandering and make the transition to minimalist life easier globally. A free platform supporting community businesses to create the future we collectively dream of.",
    featured: true
  },
  {
    id: 12,
    name: "Blue Umbrella Token",
    slug: "blue-umbrella",
    category: ["Memecoin"],
    ticker: "$BUT",
    owner: "Optimystic Prime",
    logo: "blue-umbrella.png",
    x: "https://x.com/blueumbrellabut",
    website: "https://wanderingfootprint.org/but",
    firstLedger: "https://firstledger.net/token-v2/riQtZKAtGWGRThMNBGz8RtLGAKHd7Za8x/BUT",
    description: "Community token powering the Wandering Footprint ecosystem. Supporting minimalist life and global freedom.",
    featured: false
  },
  {
    id: 13,
    name: "Chill Guy XRPL",
    slug: "chill-guy-xrpl",
    category: ["Memecoin", "NFT"],
    ticker: "$CHILLGUY",
    logo: "chill-guy-xrpl.png",
    x: "https://x.com/ChillguyXRPL",
    website: "https://chillguyxrpl.xyz",
    firstLedger: "https://firstledger.net/token-v2/rnMFxp6fBSzDm13MgKDNKbVy1z2gjiLCh8/4348494C4C475559000000000000000000000000",
    description: "I'm just a chill guy. The most laid-back memecoin on XRPL. No stress, just vibes.",
    featured: false
  },
  {
    id: 14,
    name: "XRZillas",
    slug: "xrzillas",
    category: ["Community"],
    lead: "Stake N Bake Bully",
    logo: "xrzillas.png",
    leadX: "https://x.com/Stake_N_Bake106",
    x: "https://x.com/XRZillas",
    website: "https://www.youtube.com/c/Bullzilla123",
    telegram: "https://t.me/XRzillas",
    description: "Community-driven XRPL project bringing education, entertainment, and engagement to the ecosystem. Building the future together.",
    featured: false
  },
  {
    id: 15,
    name: "Dip A Toe Show",
    slug: "dip-a-toe-show",
    category: ["Community", "Media"],
    hosts: "WorldBeFree & Simon",
    logo: "dip-a-toe-show.png",
    x: "https://x.com/DipAToeShow",
    website: "https://youtube.com/@dipatoe",
    description: "Exploring the World of Crypto! Join Melissa and Simon every Wednesday 8pm-10pm ET. Whether you're an expert or just dipping a toe, share knowledge and learn together!",
    featured: false
  },
  {
    id: 16,
    name: "Sundo Art",
    slug: "sundo-art",
    category: ["Artist"],
    logo: "sundo-art.png",
    x: "https://x.com/SundoArt",
    linktree: "https://linktr.ee/The13thArcanum",
    description: "Art made up of a million little pieces. A journey from years in the shadows back into the light. Reclaiming passion and purpose. The fire has come back to life.",
    featured: false
  }
];

const featuredSponsors = sponsorsData.filter(s => s.featured);

const allCategories = ["All", "Memecoin", "NFT", "Artist", "Community", "Business", "Gaming", "Media"];

function getRandomSponsors(count = 8) {
  const shuffled = [...sponsorsData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function filterByCategory(category) {
  if (category === "All") return sponsorsData;
  return sponsorsData.filter(s => s.category.includes(category));
}
