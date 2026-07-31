/**
 * Bring Glass Card
 * ----------------
 * A frosted-glass tile view for Home Assistant todo lists (shopping lists).
 *
 * - Tap a tile to check an item off, long-press for quantity and details
 * - The add field doubles as a live search over the current list
 * - Icons and colors are derived from the item name automatically
 * - Several lists in one card, switchable via tabs
 *
 * https://github.com/donsebby/bring-glass-card
 * MIT licensed.
 */

const CARD_VERSION = '1.0.2';

// eslint-disable-next-line no-console
console.info(
  `%c BRING-GLASS-CARD %c v${CARD_VERSION} `,
  'color: white; background: #7bbf6a; font-weight: 700;',
  'color: #7bbf6a; background: white; font-weight: 700;'
);

// Fallback colors for items that do not match any rule. The color is picked
// from the item name's hash, so a given item always keeps the same color.
const PALETTE = ['#a78bfa', '#d9b45c', '#5ec6c2', '#7bbf6a', '#5ea8d9', '#e0b84a', '#8a95a5', '#e07bc0'];

// Category colors - deliberately warm and desaturated so the tiles sit well
// inside a liquid-glass dashboard.
const CAT = { b: '#5ea8d9', g: '#7bbf6a', y: '#e0b84a', d: '#d9b45c', p: '#e07bc0', v: '#a78bfa', t: '#5ec6c2', s: '#8a95a5' };

// Non-ASCII characters are built from char codes rather than written
// literally. That keeps this file pure ASCII, which survives hosting setups
// that serve JavaScript without an explicit UTF-8 charset.
const CH = (n) => String.fromCharCode(n);
const ELL = CH(8230); // horizontal ellipsis
const MID = CH(183);  // middle dot
const SS = CH(223);   // sharp s

/**
 * Automatic icon detection. One rule per line:
 *
 *   pattern=icon-without-mdi-prefix=colorCode
 *
 * First match wins, so ordering matters - specific cases at the top, generic
 * categories below. Patterns run against the NORMALIZED item name (lower
 * case, diacritics and sharp s folded, punctuation collapsed to spaces),
 * which is why they are written without umlauts here: "kase" also matches
 * "Kaese" and "Kase". German and English keywords are mixed per rule.
 */
const RULES_SRC = `
toilet ?paper|toilet ?roll|kitchen ?roll|kitchen ?towel|paper ?towel|kuchenrolle|kuchenpapier|kuchentuch=paper-roll=s
ice ?cream|icecreme|gelato|sorbet=ice-cream=v
dish ?soap|dish ?washing|washing ?up|dishwasher ?tab=dishwasher=t
kartoffelsalat|nudelsalat|krautsalat|fleischsalat|coleslaw|potato ?salad=bowl-mix=d
cola|coke|fanta|sprite|mezzo|spezi|limo|brause|eistee|icetea|lemonade|soda|energy=bottle-soda=b
wasser|water|sprudel|mineralwasser|selters|sparkling=water=b
saft|juice|nektar|smoothie|schorle|sirup|syrup=cup=y
bier|beer|radler|pils|weizen|ale|lager=beer=y
\\bwein|wine|rotwein|weisswein|gluhwein|sekt|prosecco|champagner|champagne=glass-wine=p
schnaps|likor|liquor|wodka|vodka|rum\\b|whisky|whiskey|\\bgin\\b|aperol|campari=bottle-wine=d
kaffee|coffee|espresso|cappuccino|latte macchiato=coffee=s
tee\\b|tea\\b|teebeutel|teabag|krautertee|kamillentee=tea=g
kakao|cocoa|trinkschokolade|ovomaltine=cup=d
milch|milk|hafermilch|sojamilch|mandelmilch|buttermilch|oat ?milk=bottle-soda-classic=b
kase|cheese|gouda|mozzarella|parmesan|feta|camembert|brie|tilsiter|butter|margarine|halloumi=cheese=y
sahne|cream|schmand|fraiche|sauerrahm|mascarpone=bottle-soda-classic=b
joghurt|jogurt|yoghurt|yogurt|quark|skyr|kefir=cup=b
eier|eggs|freilandei|\\bei\\b|\\begg\\b=egg=y
brotchen|semmel|toast|baguette|brot|bread|roll\\b|brezel|pretzel|croissant|bun=bread-slice=d
kuchen|\\btorte|cake|muffin|geback|donut|waffel|waffle|pastry=cake-variant=v
mehl|flour|hefe|yeast|backpulver|griess|semolina=barley=d
zucker|sugar|salz|salt|pfeffer|\\bpepper\\b|peppercorn|gewurz|spice|zimt|cinnamon|curry|oregano|basilikum=shaker-outline=s
zitrone|lemon|limette|lime|orange|mandarine|clementine|grapefruit=fruit-citrus=y
erdbeer|strawberr|himbeer|raspberr|heidelbeer|blueberr|brombeer|johannisbeer|kirsch|cherr|beere|berry|berries=fruit-cherries=p
traube|grape|rosine|raisin=fruit-grapes=v
ananas|pineapple|mango|papaya|kiwi|banane|banana|avocado=fruit-pineapple=y
melone|melon=fruit-watermelon=g
apfel|apple|\\bbirne|pear|quitte|pfirsich|peach|nektarine|pflaume|plum|aprikose|apricot|obst|fruit=food-apple=g
salat|salad|lettuce|spinat|spinach|rucola|rocket|kohlrabi|weisskohl|rotkohl|rosenkohl|grunkohl|kale|brokkoli|broccoli|blumenkohl|cauliflower|lauch|leek|zucchini|aubergine|kurbis|pumpkin|bohnen|beans|erbsen|peas=leaf=g
karotte|carrot|mohre|gemuse|vegetable|gurke|cucumber|sellerie|celery|rettich|radieschen|radish|spargel|asparagus=carrot=g
paprika|bell ?pepper|chili|peperoni|jalapeno=chili-mild=g
tomate|tomato|passata|ketchup|tomatenmark=fruit-cherries=p
zwiebel|onion|knoblauch|garlic|schalotte|shallot|ingwer|ginger=food-variant=d
kartoffel|potato|pommes|fries|rosti|kroketten|wedges=french-fries=d
pilz|mushroom|champignon|steinpilz|pfifferling=mushroom=d
\\bmais|corn|polenta=corn=y
hund|\\bdog=dog=d
katze|\\bcat\\b|kitten|streu|litter=cat=d
futter|pet ?food|dog ?food|cat ?food|leckerli|treats|kaninchen|rabbit|hamster|meerschwein|vogelfutter=paw=d
schnitzel|steak|gulasch|goulash|braten|roast|filet|fillet|hackfleisch|\\bhack|mince|rinder|beef|schwein|pork|lamm|lamb|kotelett|chop|frikadelle|bulette|meatball|fleisch|meat=food-steak=p
wurst|sausage|salami|schinken|\\bham\\b|speck|bacon|aufschnitt|leberkas|bratwurst=sausage=p
pute|turkey|hahnchen|chicken|huhn|geflugel|poultry|ente|duck|gans|goose=food-drumstick=p
fisch|fish|lachs|salmon|thunfisch|tuna|forelle|trout|garnele|shrimp|prawn|matjes|hering|herring|scampi=fish=b
tofu|seitan|veggie|vegan|falafel=sprout=g
grill|barbecue|\\bbbq|brikett|briquette|holzkohle|kohle|charcoal|anzunder|firelighter|feuerzeug|lighter=grill=y
\\breis\\b|\\brice\\b|risotto|basmati|langkornreis=rice=d
nudel|noodle|\\bpasta\\b|spaghetti|tortellini|ravioli|gnocchi|lasagne|lasagna|maccaroni|macaroni=pasta=d
konserve|\\bcan\\b|canned|dose|linsen|lentil|kichererbsen|chickpea=food-variant=g
\\bol\\b|\\boil\\b|olivenol|oliveoil|sonnenblumenol|rapsol|essig|vinegar|balsamico=oil=y
honig|honey|marmelade|\\bjam\\b|konfiture|nutella|aufstrich|spread|gelee|jelly=beehive-outline=y
suppe|soup|bruhe|broth|fond|sosse|sauce|dressing|mayo|senf|mustard=bowl-mix=d
musli|muesli|cereal|cornflakes|haferflocken|oats|granola|porridge=bowl-mix=d
eis\\b|eiscreme|speiseeis|magnum=ice-cream=v
schoko|chocolate|praline|riegel|\\bbar\\b|milka|marzipan=cookie=d
keks|cookie|biscuit|prinzenrolle|leibniz|butterkeks=cookie=d
kaugummi|\\bgum\\b|bonbon|candy|gummibar|lakritz|licorice|sussigkeit|sweets|smarties|haribo=candy=p
chips|crisps|pringel|cracker|flips|popcorn|salzstange|pretzelstick|nuss|\\bnut|mandel|almond|studentenfutter=popcorn=y
pudding|dessert|griessbrei|mousse|custard=cup=v
zahn|tooth|dental|floss=toothbrush-paste=t
dusch|shower|badezusatz|schaumbad|bubblebath=shower-head=t
shampoo|schampoo|spulung|conditioner|gliss|haarkur|\\bkur\\b=bottle-tonic=t
haarspray|hair ?spray|\\bdeo\\b|deoroller|deodorant|antiperspirant|antitranspirant=spray=t
haarfarbe|hair ?color|haargel|hair ?gel|haarwachs|\\bhaar|\\bhair=hair-dryer=t
seife|soap|handseife|handwaschgel|desinfekt|sanitizer=hand-wash=t
lotion|creme|cream skin|salbe|ointment|hirschtalg|balsam|balm|nivea|penaten|vaseline|labello=lotion=t
rasier|shaving|razor|klingen|blades|epilierer=razor-double-edge=s
make ?up|lippenstift|lipstick|mascara|wimpern|nagellack|nail ?polish|schminke|puder|face ?powder=lipstick=p
parfum|perfume|eau de|duftspray=spray=p
watte|cotton|wattestabchen|wattepad|abschminkpad=lotion=t
tampon|binden|slipeinlage|pantyliner|damenhygiene|sanitary=water-outline=p
windel|diaper|nappy|wickel|babybrei|schnuller|pacifier|babyol|babypuder|\\bbaby=human-baby-changing-table=p
milchpulver|formula|folgemilch|pre ?nahrung=baby-bottle=p
toilettenpapier|klopapier|toiletpaper|papierrolle|taschentuch|tissue|tempo|feuchttuch|wipes|serviette|napkin=paper-roll=s
mullbeutel|bin ?bag|trash ?bag|garbage ?bag|mullsack|gefrierbeutel|freezer ?bag|frischhaltefolie|cling ?film|alufolie|foil|backpapier|baking ?paper=trash-can-outline=s
waschmittel|detergent|washing ?powder|weichspuler|softener|entkalker|descaler|fleckenentferner|stain ?remover=washing-machine=t
spulmittel|spultab|klarspuler|rinse ?aid|geschirrspul=dishwasher=t
reiniger|cleaner|putzmittel|allzweck|all ?purpose|glasreiniger|scheuermilch|essigreiniger|\\bwc|bathroom=spray-bottle=t
schwamm|sponge|lappen|cloth|wischmop|\\bmop|besen|broom|staubsaugerbeutel|vacuum ?bag|mikrofaser=broom=s
kerze|candle|teelicht|tealight|streichholz|match|duftkerze=candle=y
batterie|batter|\\bakku|knopfzelle|button ?cell|ladekabel|charger=battery=s
gluhbirne|light ?bulb|bulb|leuchtmittel|lampe|\\blamp=lightbulb=y
schraub|screw|dubel|dowel|nagel|\\bnail\\b|scharnier|hinge|unterlegscheibe|washer=screw-flat-top=s
werkzeug|tool|hammer|zange|pliers|sage|\\bsaw\\b|bohrer|drill|akkuschrauber|schraubendreher|screwdriver=hammer-wrench=s
farbe|paint|lack|varnish|pinsel|brush|grundierung|primer|spachtel|abdeckfolie=format-paint=t
kleb|glue|tape|silikon|silicone|panzertape|kabelbinder|zip tie=tools=s
blumenerde|pflanze|plant|blume|flower|samen|seed|dunger|fertilizer|rasensamen|substrat=flower=g
heft|notebook|schreibblock|din a|briefumschlag|envelope|stift|\\bpen\\b|pencil|kugelschreiber|filzstift|marker|radiergummi|eraser|schere|scissors|ordner|binder|papier|paper=notebook=b
tablette|tablet|pill|schmerzmittel|painkiller|\\bibu|paracetamol|aspirin|momet|pflaster|plaster|bandaid|verband|bandage|nasenspray|hustensaft|cough|vitamin|magnesium|traubenzucker=medical-bag=p
`;

// Translate the rule table into [RegExp, icon, color] once at load time.
const ICON_RULES = RULES_SRC.trim().split('\n').map((line) => {
  const p = line.split('=');
  return [new RegExp(p[0]), 'mdi:' + p[1], CAT[p[2]] || CAT.s];
});

const COMBINING = new RegExp('[' + CH(768) + '-' + CH(879) + ']', 'g');

// Quantity prefix when adding ("2 l milk", "3x bread"). Built from a string
// so the file needs no literal non-ASCII character.
const ADD_RE = new RegExp('^(\\d+\\s*(?:x|st(?:' + CH(252) + '|u)ck|pc|pcs|kg|g|lb|oz|l|ml|pkg|pck|pack|dose|dosen|can|cans|bottles?|flaschen?)?\\.?)\\s+(.*)$', 'i');

/**
 * Fold a name into a comparable key: lower case, sharp s to "ss", diacritics
 * stripped, everything else collapsed to single spaces. Both the icon rules
 * and the search run against this, so "Kaese", "Kase" and "kase" are equal.
 */
const norm = (s) => String(s == null ? '' : s)
  .toLowerCase()
  .split(SS).join('ss')
  .normalize('NFD')
  .replace(COMBINING, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

// Every visible string. Override individually via the `labels:` option -
// see the README for a full German example.
const LABELS = {
  title: 'Shopping list',
  add: 'Add item',
  open: '{n} open',
  updated_now: 'updated just now',
  updated_min: 'updated {n} min ago',
  updated_hour: 'updated {n} h ago',
  updated_day: 'updated {n} d ago',
  empty_title: 'All done',
  empty_text: 'Nothing left on this list. Need something? Just type it above.',
  search_title: 'No matches',
  search_text: 'Press Enter or + to add it as a new item.',
  loading: `Loading list ${ELL}`,
  done_title: 'Recently done',
  hint: `Tap to check off ${MID} long-press for details & quantity`,
  sheet_on: 'on {list}',
  sheet_label: 'Quantity / note',
  sheet_placeholder: 'e.g. 2 litres',
  delete: 'Delete',
  pcs: 'pcs',
  close: 'Done',
};

const DEFAULT_CHIPS = ['1 pc', '2 pcs', '500 g', '1 kg', '1 l', 'Organic'];

const LAYOUTS = {
  kacheln: { col: '122px', gap: '12px', dir: 'column', pad: '15px 10px', minH: '134px', box: '68px', glyph: '36px', name: '13.5px', qty: '11.5px', ta: 'center', text: '24px' },
  kompakt: { col: '94px', gap: '8px', dir: 'column', pad: '11px 6px', minH: '108px', box: '52px', glyph: '28px', name: '11.5px', qty: '10.5px', ta: 'center', text: '32px' },
  zeilen: { col: '236px', gap: '8px', dir: 'row', pad: '11px 12px', minH: '0px', box: '48px', glyph: '26px', name: '13px', qty: '11.5px', ta: 'left', text: 'auto' },
};

const STYLE = `
:host{display:block;font-family:var(--paper-font-body1_-_font-family,Roboto,Helvetica,Arial,sans-serif);
--ink:var(--primary-text-color,#fff);--txt:var(--primary-text-color,rgba(255,255,255,0.95));
--txt2:var(--secondary-text-color,rgba(255,255,255,0.55));
--l7:color-mix(in srgb,var(--ink) 7%,transparent);--l12:color-mix(in srgb,var(--ink) 12%,transparent);
--l13:color-mix(in srgb,var(--ink) 13%,transparent);--l26:color-mix(in srgb,var(--ink) 26%,rgba(255,255,255,0.5));
--gbg:linear-gradient(155deg,rgba(255,255,255,0.5) 0%,rgba(255,255,255,0.22) 45%,rgba(255,255,255,0.4) 100%);
--gsh:inset 0 1px 1px rgba(255,255,255,0.28),inset 2px 0 4px rgba(80,200,255,0.28),inset -2px 0 4px rgba(255,90,190,0.25)}
.card{box-sizing:border-box;background:color-mix(in oklch,var(--card-background-color,#17181f) var(--bg-pct,70%),transparent);
backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%);
border:1px solid var(--l12);border-radius:22px;padding:18px;
box-shadow:0 20px 40px -20px rgba(0,0,0,0.35),inset 0 1px 0 var(--l12)}
/* frame: false - for cards that already sit inside a glass container such as
   a Bubble Card popup: no second frame, no doubled blur, no inner padding. */
.card.bare{background:none;backdrop-filter:none;-webkit-backdrop-filter:none;
border:none;border-radius:0;padding:0;box-shadow:none}
/* One row, always: the tabs keep their width (flex:none), the title gives way
   with an ellipsis - nothing wraps onto a second line. */
.head{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}
.head-l{flex:1 1 auto;min-width:0}
.titles{display:flex;align-items:baseline;gap:8px;min-width:0}
.title{font-size:17px;font-weight:700;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.count{font-size:12px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--l13);color:var(--txt2);
white-space:nowrap;flex:none}
.sub{font-size:11.5px;margin-top:3px;color:var(--txt2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tabs{display:flex;gap:6px;justify-content:flex-end;flex:none;margin-left:auto;max-width:100%;overflow-x:auto}
.tab{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:11px;cursor:pointer;user-select:none;
white-space:nowrap;font-size:12px;font-weight:600;transition:background .15s ease;color:var(--txt2);background:transparent}
.tab ha-icon{--mdc-icon-size:15px}
.tab.on{color:var(--txt);background:var(--gbg);box-shadow:var(--gsh)}
.addbar{display:flex;gap:8px;margin-bottom:16px}
.addfield{flex:1;display:flex;align-items:center;gap:8px;padding:0 12px;border-radius:14px;background:var(--l7);border:1px solid var(--l12)}
.addfield ha-icon{--mdc-icon-size:18px;opacity:.45;color:var(--ink)}
.addfield input{flex:1;min-width:0;background:transparent;border:none;outline:none;padding:11px 0;font-family:inherit;font-size:14px;color:var(--txt)}
.addbtn{display:flex;align-items:center;justify-content:center;width:46px;border-radius:14px;cursor:pointer;
color:var(--ink);border:1px solid var(--l26);background:var(--gbg);box-shadow:var(--gsh)}
.addbtn ha-icon{--mdc-icon-size:22px}
/* align-items:start is deliberate: with stretch, WebKit derives the tile
   WIDTH from the stretched row height (aspect-ratio), which makes tiles
   narrower than their column and leaves a gap on the right. */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--col),1fr));gap:var(--gap);align-items:start}
.tile{display:flex;flex-direction:var(--dir);align-items:center;justify-content:center;gap:10px;box-sizing:border-box;
min-width:0;padding:var(--pad);min-height:var(--min-h);aspect-ratio:var(--ratio,auto);
border-radius:var(--tile-radius,18px);cursor:pointer;user-select:none;
-webkit-tap-highlight-color:transparent;touch-action:manipulation;background:var(--l7);border:1px solid var(--l12);
transition:transform .12s ease,background .15s ease,box-shadow .15s ease,opacity .15s ease}
.tile:active{transform:scale(0.96)}
/* Glow: the item color radiates out of the tile itself */
.tile.glow{background:radial-gradient(120% 90% at 50% 0%,color-mix(in srgb,var(--c) 20%,transparent) 0%,transparent 72%),var(--l7);
border:1px solid color-mix(in srgb,var(--c) 32%,var(--l12));
box-shadow:0 8px 26px -12px color-mix(in srgb,var(--c) 70%,transparent),
inset 0 0 22px -10px color-mix(in srgb,var(--c) 85%,transparent),
inset 0 1px 0 color-mix(in srgb,var(--c) 22%,transparent)}
.box{width:var(--box);height:var(--box);flex:none;display:flex;align-items:center;justify-content:center;color:var(--ink);
border:none;background:none;box-shadow:none;transition:filter .12s ease}
.box.tinted{color:color-mix(in srgb,var(--c) 82%,var(--ink));
filter:drop-shadow(0 0 10px color-mix(in srgb,var(--c) 55%,transparent)) saturate(125%)}
.box ha-icon{--mdc-icon-size:var(--glyph)}
.text{min-width:0;text-align:var(--ta);width:var(--text-w,100%);min-height:var(--text-h);flex:var(--text-flex,0 1 auto)}
.name{font-size:var(--name);font-weight:600;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qty{font-size:var(--qty);margin-top:2px;color:var(--txt2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile.done,.tile.done.glow{background:transparent;border-style:dashed;box-shadow:none;
border-color:var(--l13);opacity:.55}
.tile.done .box{filter:grayscale(1);opacity:.6}
.tile.done .name{text-decoration:line-through;color:var(--txt2)}
.tile.done .qty{opacity:.7}
.empty{display:flex;flex-direction:column;align-items:center;gap:10px;padding:46px 20px;text-align:center}
.empty.loading{opacity:.6;animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:.45}50%{opacity:.8}}
.empty-box{width:62px;height:62px;border-radius:20px;display:flex;align-items:center;justify-content:center;color:var(--ink);
border:1px solid rgba(255,255,255,0.5);
background:linear-gradient(155deg,rgba(123,191,106,0.5) 0%,rgba(255,255,255,0.12) 45%,rgba(123,191,106,0.5) 100%);
box-shadow:inset 0 0 14px rgba(123,191,106,0.5),inset 0 1px 1px rgba(255,255,255,0.5),0 0 18px -2px rgba(123,191,106,0.6)}
.empty-box ha-icon{--mdc-icon-size:30px}
.empty-t{font-size:15px;font-weight:700;color:var(--txt)}
.empty-s{font-size:12.5px;max-width:280px;text-wrap:pretty;color:var(--txt2)}
.donesec{margin-top:16px;border-top:1px solid var(--l12);padding-top:12px}
.donehead{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;font-size:12.5px;font-weight:600;color:var(--txt2)}
.donehead ha-icon{--mdc-icon-size:18px}
.donehead .pill{padding:1px 7px;border-radius:999px;background:var(--l13)}
.donegrid{margin-top:12px}
.hint{font-size:11.5px;text-align:center;margin-top:14px;color:var(--txt2);opacity:.8}
.veil{position:fixed;inset:0;z-index:9;display:flex;align-items:center;justify-content:center;padding:20px;
background:rgba(8,9,14,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.sheet{width:100%;max-width:380px;box-sizing:border-box;border-radius:24px;padding:22px;
background:var(--card-background-color,#17181f);border:1px solid var(--l12);box-shadow:0 40px 70px -30px rgba(0,0,0,0.7)}
.sheet-head{display:flex;align-items:center;gap:14px}
.sheet-box{--box:62px;--glyph:30px}
.sheet-name{font-size:18px;font-weight:700;color:var(--txt)}
.sheet-sub{font-size:11.5px;margin-top:2px;color:var(--txt2)}
.label{font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;opacity:.45;margin:20px 0 8px;color:var(--ink)}
.sheet input{width:100%;box-sizing:border-box;padding:11px 13px;border-radius:14px;outline:none;font-family:inherit;
font-size:14px;color:var(--txt);background:var(--l7);border:1px solid var(--l12)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.chip{padding:6px 11px;border-radius:999px;cursor:pointer;user-select:none;font-size:12px;color:var(--txt);
background:var(--l7);border:1px solid var(--l12)}
.sheet-actions{display:flex;gap:8px;margin-top:22px}
.btn-del{display:flex;align-items:center;justify-content:center;gap:6px;padding:12px 16px;border-radius:14px;cursor:pointer;
user-select:none;font-size:13px;font-weight:600;color:#e07b7b;background:rgba(224,123,123,0.1);border:1px solid rgba(224,123,123,0.28)}
.btn-del ha-icon{--mdc-icon-size:17px}
.btn-ok{flex:1;display:flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:14px;cursor:pointer;
user-select:none;font-size:13px;font-weight:700;color:var(--ink);border:1px solid var(--l26);background:var(--gbg);box-shadow:var(--gsh)}
`;

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// The three empty states (no search match, all done, still loading) share
// one shell - less markup and the cases stay visually consistent.
const emptyHtml = (icon, title, sub, cls) => `<div class="empty${cls || ''}">
    <div class="empty-box"><ha-icon icon="mdi:${icon}"></ha-icon></div>
    <div class="empty-t">${esc(title)}</div>
    ${sub ? `<div class="empty-s">${esc(sub)}</div>` : ''}
  </div>`;

class BringGlassCard extends HTMLElement {
  setConfig(config) {
    const lists = config.lists || (config.entity ? [{ entity: config.entity }] : null);
    if (!lists || !lists.length) {
      throw new Error('bring-glass-card: "lists" (or "entity") with at least one todo entity is required.');
    }
    lists.forEach((l) => {
      if (!l.entity || !l.entity.startsWith('todo.')) {
        throw new Error('bring-glass-card: every list needs a todo.* entity.');
      }
    });
    this._config = { ...config, lists };
    this._l = { ...LABELS, ...(config.labels || {}) };
    this._metaCache = {};
    this._active = 0;
    this._items = {};
    this._loaded = {};
    this._q = '';
    this._doneOpen = !!config.done_expanded;
    this._sheet = null;
    this._build();
    this._applyLayout();
    this._render();
    this._fetchAll();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (!this._config) return;
    // IMPORTANT: do NOT render on every hass assignment. Home Assistant sets
    // `hass` on every state change anywhere in the house - easily once per
    // second - and a full innerHTML rebuild on each tick tears down and
    // recreates every tile including its <ha-icon>. That starves the main
    // thread and can take the WebView down on mobile.
    //
    // Only two things need to reach the DOM:
    //   1. the very first hass, so the card paints its loading placeholder
    //   2. a change to one of the configured lists - the todo entity's state
    //      is its open-item count, so any add/complete/remove (including ones
    //      made in another app) shows up in this signature. _fetchAll()
    //      renders once the new items have arrived.
    // Everything else is just a newer hass reference we keep around.
    const sig = this._config.lists
      .map((l) => {
        const st = hass.states[l.entity];
        return st ? `${l.entity}:${st.state}:${st.last_changed}` : `${l.entity}:-`;
      })
      .join('|');
    const changed = sig !== this._sig;
    if (changed) this._sig = sig;
    if (first) this._render();
    if (changed) this._fetchAll();
  }

  connectedCallback() {
    // Fallback poll: description-only edits do not change the entity state,
    // so a slow tick keeps a wall tablet in sync without hammering the API.
    // Clear first - a card can be reconnected without disconnectedCallback
    // having run, and stacked intervals would multiply the WebSocket calls.
    clearInterval(this._poll);
    this._poll = setInterval(() => this._fetchAll(), (this._config?.refresh_seconds || 120) * 1000);
  }

  disconnectedCallback() {
    clearInterval(this._poll);
    clearTimeout(this._pressTimer);
  }

  getCardSize() { return 6; }

  static getStubConfig() {
    return { type: 'custom:bring-glass-card', layout: 'kacheln', lists: [{ entity: 'todo.shopping_list', name: 'Groceries', icon: 'mdi:cart-outline' }] };
  }

  static getConfigElement() { return document.createElement('bring-glass-card-editor'); }

  // Label lookup with {placeholder} substitution.
  // NOTE: never store anything on `this._t` - an instance property would
  // shadow this prototype method and every label lookup would throw.
  _t(key, vars) {
    let s = this._l[key] || '';
    if (vars) for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(vars[k]);
    return s;
  }

  _timeAgo(iso) {
    if (!iso) return '';
    const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return this._t('updated_now');
    if (min < 60) return this._t('updated_min', { n: min });
    const h = Math.round(min / 60);
    if (h < 24) return this._t('updated_hour', { n: h });
    return this._t('updated_day', { n: Math.round(h / 24) });
  }

  // ------------------------------------------------------------------
  // Data
  // ------------------------------------------------------------------

  // Clamp: a config edit can shrink `lists` while a later tab is selected.
  _list(i) {
    const lists = this._config.lists;
    return lists[Math.min(i === undefined ? this._active : i, lists.length - 1)] || lists[0];
  }

  _entity(i) { return this._list(i).entity; }

  async _fetchAll() {
    if (!this._hass || !this._config) return;
    await Promise.all(this._config.lists.map((l) => this._fetch(l.entity)));
    this._render();
  }

  async _fetch(entityId) {
    try {
      // execute_script instead of callService(..., returnResponse) so the
      // card works across HA versions with the same call shape.
      const res = await this._hass.callWS({
        type: 'execute_script',
        sequence: [
          { service: 'todo.get_items', data: { status: ['needs_action', 'completed'] }, target: { entity_id: entityId }, response_variable: 'r' },
          { stop: '', response_variable: 'r' },
        ],
      });
      const items = res?.response?.[entityId]?.items || [];
      this._items[entityId] = items;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('bring-glass-card: get_items failed', err);
      this._items[entityId] = this._items[entityId] || [];
    }
    // Only from here on does "no open items" really mean empty rather than
    // not loaded yet - see the placeholder in _renderList().
    this._loaded[entityId] = true;
  }

  _call(service, data) {
    return this._hass
      .callService('todo', service, data, { entity_id: this._entity() })
      .then(() => this._fetch(this._entity()))
      .then(() => this._render());
  }

  _haptic(detail) {
    this.dispatchEvent(new CustomEvent('haptic', { bubbles: true, composed: true, detail }));
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(detail === 'medium' ? 14 : 8);
  }

  _meta(item) {
    const key = norm(item.summary);
    const cache = this._metaCache || (this._metaCache = {});
    if (cache[key]) return cache[key];
    const res = this._resolveMeta(key);
    cache[key] = res;
    return res;
  }

  _resolveMeta(key) {
    // 1. Explicit mappings from `icons:` always win.
    const custom = this._config.icons || {};
    for (const k of Object.keys(custom)) {
      if (key.includes(norm(k))) {
        const val = custom[k];
        if (typeof val === 'string') return { icon: val, color: this._hashColor(key) };
        return { icon: val.icon, color: val.color || this._hashColor(key) };
      }
    }
    // 2. Automatic detection via the rule table.
    const hit = ICON_RULES.find((r) => r[0].test(key));
    if (hit) return { icon: hit[1], color: hit[2] };
    // 3. Fallback: basket icon, color hashed from the name (stays stable).
    return { icon: this._config.default_icon || 'mdi:basket-outline', color: this._hashColor(key) };
  }

  _hashColor(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 997;
    return PALETTE[h % PALETTE.length];
  }

  // ------------------------------------------------------------------
  // DOM
  // ------------------------------------------------------------------

  _build() {
    if (this._built) return;
    this._built = true;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="card"></div><div class="veil-host"></div>`;
    this._cardEl = this.shadowRoot.querySelector('.card');
    this._veilHost = this.shadowRoot.querySelector('.veil-host');

    this.shadowRoot.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-tab]');
      if (tab) { this._active = Number(tab.dataset.tab); this._sheet = null; this._render(); this._fetch(this._entity()).then(() => this._render()); return; }
      if (e.target.closest('[data-done-head]')) { this._doneOpen = !this._doneOpen; this._render(); return; }
      if (e.target.closest('[data-add]')) { this._addFromInput(); return; }
      if (e.target.closest('[data-sheet-close]')) { this._sheet = null; this._renderSheet(); return; }
      if (e.target.closest('[data-sheet-del]')) { const uid = this._sheet; this._sheet = null; this._renderSheet(); this._call('remove_item', { item: uid }); return; }
      const chip = e.target.closest('[data-chip]');
      if (chip) { this._saveQty(chip.dataset.chip); return; }
      if (e.target.closest('.sheet')) return;
      if (e.target.closest('.veil')) { this._sheet = null; this._renderSheet(); }
    });

    this.shadowRoot.addEventListener('keydown', (e) => {
      if (e.target.matches('[data-input]') && e.key === 'Enter') this._addFromInput();
    });

    // The add field doubles as a search box: typing filters the tiles,
    // Enter or + adds the text as a new item.
    // Deliberately _renderList() only: rebuilding the whole card here would
    // replace the <input> as well, which makes iOS abort the keyboard
    // session and swallow characters when typing fast.
    this.shadowRoot.addEventListener('input', (e) => {
      if (e.target.matches('[data-input]')) { this._q = e.target.value; this._renderList(); }
    });

    this.shadowRoot.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-uid]')) e.preventDefault(); });

    // Tap = check off, long-press = detail sheet.
    this.shadowRoot.addEventListener('pointerdown', (e) => {
      const tile = e.target.closest('[data-uid]');
      if (!tile) return;
      this._long = false;
      clearTimeout(this._pressTimer);
      const uid = tile.dataset.uid;
      this._pressTimer = setTimeout(() => { this._long = true; this._haptic('medium'); this._sheet = uid; this._renderSheet(); }, 420);
    });
    this.shadowRoot.addEventListener('pointerup', (e) => {
      const tile = e.target.closest('[data-uid]');
      clearTimeout(this._pressTimer);
      if (!tile || this._long) return;
      this._haptic('light');
      this._call('update_item', { item: tile.dataset.uid, status: tile.dataset.done === '1' ? 'needs_action' : 'completed' });
    });
    this.shadowRoot.addEventListener('pointercancel', () => clearTimeout(this._pressTimer));
    this.shadowRoot.addEventListener('pointerleave', () => clearTimeout(this._pressTimer), true);
  }

  _applyLayout() {
    const c = this._config;
    const l = LAYOUTS[c.layout] || LAYOUTS.kacheln;
    const s = this.style;
    s.setProperty('--col', l.col);
    s.setProperty('--gap', l.gap);
    s.setProperty('--dir', l.dir);
    s.setProperty('--pad', l.pad);
    s.setProperty('--min-h', l.minH);
    s.setProperty('--box', l.box);
    s.setProperty('--glyph', l.glyph);
    s.setProperty('--name', l.name);
    s.setProperty('--qty', l.qty);
    s.setProperty('--ta', l.ta);
    // Fixed text height: keeps the icons on the same baseline in every tile,
    // whether or not a quantity is present.
    s.setProperty('--text-h', l.text === 'auto' ? '0px' : l.text);
    s.setProperty('--text-w', l.dir === 'row' ? 'auto' : '100%');
    s.setProperty('--text-flex', l.dir === 'row' ? '1' : '0 1 auto');
    s.setProperty('--ratio', l.dir === 'row' ? 'auto' : '1 / 1');
    s.setProperty('--tile-radius', (c.tile_radius != null ? c.tile_radius : 18) + 'px');
    this._cardEl.classList.toggle('bare', c.frame === false);
    if (c.bg_opacity != null) {
      this._cardEl.style.setProperty('--bg-pct', Math.max(0, Math.min(100, c.bg_opacity * 100)) + '%');
    } else {
      this._cardEl.style.removeProperty('--bg-pct');
    }
  }

  _tileHtml(item, done) {
    const m = this._meta(item);
    const tinted = this._config.tinted !== false && !done;
    const glow = this._config.glow !== false && !done;
    const qty = (item.description || '').trim();
    return `<div class="tile${done ? ' done' : ''}${glow ? ' glow' : ''}" data-uid="${esc(item.uid)}" data-done="${done ? 1 : 0}" style="--c:${m.color}">
      <div class="box${tinted ? ' tinted' : ''}"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
      <div class="text">
        <div class="name">${esc(item.summary)}</div>
        ${qty ? `<div class="qty">${esc(qty)}</div>` : ''}
      </div>
    </div>`;
  }

  // Only the volatile part (tiles, done section, counter). Called on its own
  // while typing so the <input> stays alive in the DOM.
  _renderList() {
    if (!this._config || !this._cardEl) return;
    const cfg = this._config;
    const list = this._list();
    const all = this._items[list.entity] || [];
    // Compare the query normalized, so "kase" also matches "Kaese".
    const q = norm(this._q);
    const hit = (i) => !q || norm(i.summary + ' ' + (i.description || '')).includes(q);
    const open = all.filter((i) => i.status !== 'completed' && hit(i));
    const done = all.filter((i) => i.status === 'completed' && hit(i));

    const body = open.length
      ? `<div class="grid">${open.map((i) => this._tileHtml(i, false)).join('')}</div>`
      : q
      ? emptyHtml('magnify', this._t('search_title'), this._t('search_text'))
      : this._loaded[list.entity]
        ? emptyHtml('check-all', this._t('empty_title'), this._t('empty_text'))
        : emptyHtml('cart-outline', this._t('loading'), '', ' loading');

    const doneSec = (cfg.show_done === false || !done.length)
      ? ''
      : `<div class="donesec">
          <div class="donehead" data-done-head>
            <ha-icon icon="mdi:chevron-${this._doneOpen ? 'down' : 'right'}"></ha-icon>
            <span>${esc(this._t('done_title'))}</span><span class="pill">${done.length}</span>
          </div>
          ${this._doneOpen ? `<div class="grid donegrid">${done.map((i) => this._tileHtml(i, true)).join('')}</div>` : ''}
        </div>`;

    const cEl = this._cardEl.querySelector('[data-count]');
    if (cEl) cEl.textContent = this._t('open', { n: open.length });
    const bEl = this._cardEl.querySelector('[data-body]');
    if (bEl) bEl.innerHTML = body + doneSec;
  }

  _render() {
    if (!this._hass || !this._config || !this._cardEl) return;
    const cfg = this._config;
    const list = this._list();
    const stateObj = this._hass.states[list.entity];
    // While the field has focus, never rebuild the shell - the <input> and
    // with it the keyboard focus would be lost, whether that is triggered by
    // typing or by a state update arriving in between.
    const inp = this._cardEl.querySelector('[data-input]');
    if (inp && this.shadowRoot.activeElement === inp) { this._renderList(); this._renderSheet(); return; }
    const title = cfg.title || list.name || stateObj?.attributes?.friendly_name || this._t('title');

    const tabs = cfg.lists.length > 1
      ? `<div class="tabs">${cfg.lists.map((l, i) => {
          const st = this._hass.states[l.entity];
          const name = l.name || st?.attributes?.friendly_name || l.entity;
          return `<div class="tab${i === this._active ? ' on' : ''}" data-tab="${i}">${l.icon ? `<ha-icon icon="${esc(l.icon)}"></ha-icon>` : ''}${esc(name)}</div>`;
        }).join('')}</div>`
      : '';

    const addBar = cfg.hide_add
      ? ''
      : `<div class="addbar">
          <div class="addfield"><ha-icon icon="mdi:magnify"></ha-icon><input data-input type="text" value="${esc(this._q)}" placeholder="${esc(this._t('add'))}"></div>
          <div class="addbtn" data-add><ha-icon icon="mdi:plus"></ha-icon></div>
        </div>`;

    this._cardEl.innerHTML = `
      <div class="head">
        <div class="head-l">
          <div class="titles"><div class="title">${esc(title)}</div><div class="count" data-count></div></div>
          <div class="sub">${esc(this._timeAgo(stateObj?.last_changed))}</div>
        </div>
        ${tabs}
      </div>
      ${addBar}
      <div data-body></div>
      ${cfg.hide_hint ? '' : `<div class="hint">${esc(this._t('hint'))}</div>`}`;

    this._renderList();
    this._renderSheet();
  }

  _renderSheet() {
    const all = this._items[this._entity()] || [];
    const item = this._sheet ? all.find((i) => i.uid === this._sheet) : null;
    if (!item) { this._veilHost.innerHTML = ''; return; }
    const m = this._meta(item);
    const tinted = this._config.tinted !== false;
    const chips = this._config.qty_chips || DEFAULT_CHIPS;
    const listName = this._list().name || this._entity();
    this._veilHost.innerHTML = `<div class="veil"><div class="sheet">
      <div class="sheet-head">
        <div class="box sheet-box${tinted ? ' tinted' : ''}" style="--c:${m.color}"><ha-icon icon="${esc(m.icon)}"></ha-icon></div>
        <div style="min-width:0">
          <div class="sheet-name">${esc(item.summary)}</div>
          <div class="sheet-sub">${esc(this._t('sheet_on', { list: listName }))}</div>
        </div>
      </div>
      <div class="label">${esc(this._t('sheet_label'))}</div>
      <input data-qty type="text" placeholder="${esc(this._t('sheet_placeholder'))}" value="${esc(item.description || '')}">
      <div class="chips">${chips.map((c) => `<div class="chip" data-chip="${esc(c)}">${esc(c)}</div>`).join('')}</div>
      <div class="sheet-actions">
        <div class="btn-del" data-sheet-del><ha-icon icon="mdi:trash-can-outline"></ha-icon>${esc(this._t('delete'))}</div>
        <div class="btn-ok" data-sheet-close>${esc(this._t('close'))}</div>
      </div>
    </div></div>`;
    const qtyEl = this._veilHost.querySelector('[data-qty]');
    qtyEl.addEventListener('change', () => this._saveQty(qtyEl.value));
    qtyEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { this._saveQty(qtyEl.value); this._sheet = null; this._renderSheet(); } });
  }

  _saveQty(value) {
    const uid = this._sheet;
    if (!uid) return;
    const el = this._veilHost.querySelector('[data-qty]');
    if (el) el.value = value;
    this._call('update_item', { item: uid, description: value });
  }

  _addFromInput() {
    const el = this._cardEl.querySelector('[data-input]');
    if (!el) return;
    const raw = el.value.trim();
    if (!raw) return;
    el.value = '';
    this._q = '';
    // "2 l milk" / "3x bread" -> quantity + name, like the Bring app does.
    const m = ADD_RE.exec(raw);
    // "3x" -> "3 <pcs label>", so the unit follows the card's language.
    const qty = m ? m[1].replace(/\s*x$/i, ' ' + this._t('pcs')).trim() : '';
    const name = m ? m[2] : raw;
    this._haptic('light');
    // If the list already knows the item (completed ones included), revive
    // the existing entry instead of creating a duplicate - otherwise it
    // shows up twice under "recently done" after being checked off again.
    const key = norm(name);
    const dupe = (this._items[this._entity()] || []).find((i) => norm(i.summary) === key);
    if (dupe) {
      const data = { item: dupe.uid, status: 'needs_action' };
      if (qty) data.description = qty;
      return this._call('update_item', data);
    }
    this._call('add_item', { item: name.charAt(0).toUpperCase() + name.slice(1), description: qty || undefined });
  }
}

customElements.define('bring-glass-card', BringGlassCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'bring-glass-card',
  name: 'Bring Glass Card',
  description: 'Frosted-glass tile view for todo/shopping lists - tap to check off, long-press for quantity, several lists via tabs.',
  preview: true,
  documentationURL: 'https://github.com/donsebby/bring-glass-card',
});

// ---------------------------------------------------------------------
// Visual editor - card fields plus the list rows (entity picker).
// ---------------------------------------------------------------------
class BringGlassCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this._render(); }
  set hass(hass) { this._hass = hass; if (this._pickers) this._pickers.forEach((p) => { if (p) p.hass = hass; }); this._render(); }
  connectedCallback() { this._render(); }

  _emit(next) {
    this._config = next;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: next }, bubbles: true, composed: true }));
  }

  _top(key, value) {
    const next = { ...this._config, [key]: value };
    if (value === '' || value == null) delete next[key];
    this._emit(next);
  }

  _list(i, key, value) {
    const lists = (this._config.lists || []).map((l, idx) => {
      if (idx !== i) return l;
      const n = { ...l, [key]: value };
      if (value === '' || value == null) delete n[key];
      return n;
    });
    this._emit({ ...this._config, lists });
  }

  _render() {
    if (!this._config) return;
    if (!this._built) {
      this._built = true;
      this._pickers = [];
      this._count = -1;
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;font-size:13px}
        .s{margin-bottom:14px}.st{font-weight:600;opacity:.7;margin-bottom:6px}
        .f{display:flex;gap:6px;align-items:center;margin-bottom:6px;flex-wrap:wrap}
        label{min-width:110px;opacity:.85}
        input[type=text],input[type=number],select{flex:1;min-width:100px;padding:5px 7px;border-radius:6px;border:1px solid var(--divider-color,#ccc);background:var(--card-background-color,#fff);color:var(--primary-text-color,#000);font-size:13px}
        input[type=range]{flex:1}
        .lc{border:1px solid var(--divider-color,#ccc);border-radius:10px;padding:8px;margin-bottom:8px}
        .lh{display:flex;justify-content:space-between;margin-bottom:4px}
        .la button{background:none;border:none;cursor:pointer;font-size:14px;padding:2px 5px;opacity:.7}
        .ab{background:var(--primary-color,#03a9f4);color:#fff;border:none;border-radius:8px;padding:7px 12px;cursor:pointer}
        .ep{flex:1;min-width:100px}
        .hint{font-size:11px;opacity:.6;margin-top:4px}
        </style>
        <div class="s"><div class="st">Card</div>
          <div class="f"><label>Title</label><input type="text" data-t="title" placeholder="(list name)"></div>
          <div class="f"><label>Layout</label><select data-t="layout"><option value="kacheln">Tiles</option><option value="kompakt">Compact</option><option value="zeilen">Rows</option></select></div>
          <div class="f"><label>Transparency</label><input type="range" min="0.2" max="1" step="0.05" data-t="bg_opacity"><span data-d="bg_opacity" style="min-width:32px;font-size:12px"></span></div>
          <div class="f"><label>Corner radius</label><input type="number" min="8" max="28" data-t="tile_radius" placeholder="18"></div>
          <div class="f"><label>Own frame</label><input type="checkbox" data-t="frame"></div>
          <div class="f"><label>Colored icons</label><input type="checkbox" data-t="tinted"></div>
          <div class="f"><label>Glowing tiles</label><input type="checkbox" data-t="glow"></div>
          <div class="f"><label>Show completed</label><input type="checkbox" data-t="show_done"></div>
        </div>
        <div class="s"><div class="st">Lists</div><div class="lh2"></div><button class="ab" type="button">+ list</button></div>
        <div class="hint">Custom icons (<code>icons:</code>), quantity chips (<code>qty_chips:</code>) and translations (<code>labels:</code>) are edited in YAML mode.</div>`;
      this.shadowRoot.querySelector('[data-t="title"]').addEventListener('input', (e) => this._top('title', e.target.value));
      this.shadowRoot.querySelector('[data-t="layout"]').addEventListener('change', (e) => this._top('layout', e.target.value));
      this.shadowRoot.querySelector('[data-t="bg_opacity"]').addEventListener('input', (e) => this._top('bg_opacity', parseFloat(e.target.value)));
      this.shadowRoot.querySelector('[data-t="tile_radius"]').addEventListener('input', (e) => this._top('tile_radius', e.target.value === '' ? null : parseInt(e.target.value, 10)));
      this.shadowRoot.querySelector('[data-t="frame"]').addEventListener('change', (e) => this._top('frame', e.target.checked));
      this.shadowRoot.querySelector('[data-t="tinted"]').addEventListener('change', (e) => this._top('tinted', e.target.checked));
      this.shadowRoot.querySelector('[data-t="glow"]').addEventListener('change', (e) => this._top('glow', e.target.checked));
      this.shadowRoot.querySelector('[data-t="show_done"]').addEventListener('change', (e) => this._top('show_done', e.target.checked));
      this.shadowRoot.querySelector('.ab').addEventListener('click', () => this._emit({ ...this._config, lists: [...(this._config.lists || []), { entity: '' }] }));
    }

    const c = this._config;
    const set = (sel, v) => { const el = this.shadowRoot.querySelector(sel); if (el && el.value !== String(v ?? '')) el.value = v ?? ''; };
    set('[data-t="title"]', c.title || '');
    const layoutEl = this.shadowRoot.querySelector('[data-t="layout"]');
    if (layoutEl.value !== (c.layout || 'kacheln')) layoutEl.value = c.layout || 'kacheln';
    const bg = c.bg_opacity != null ? c.bg_opacity : 0.7;
    set('[data-t="bg_opacity"]', bg);
    this.shadowRoot.querySelector('[data-d="bg_opacity"]').textContent = bg;
    set('[data-t="tile_radius"]', c.tile_radius != null ? c.tile_radius : '');
    this.shadowRoot.querySelector('[data-t="frame"]').checked = c.frame !== false;
    this.shadowRoot.querySelector('[data-t="tinted"]').checked = c.tinted !== false;
    this.shadowRoot.querySelector('[data-t="glow"]').checked = c.glow !== false;
    this.shadowRoot.querySelector('[data-t="show_done"]').checked = c.show_done !== false;

    const lists = c.lists || [];
    if (lists.length !== this._count) { this._count = lists.length; this._buildLists(lists); } else { this._patchLists(lists); }
  }

  _buildLists(lists) {
    const host = this.shadowRoot.querySelector('.lh2');
    this._pickers = [];
    host.innerHTML = lists.map((l, i) => `<div class="lc" data-i="${i}">
      <div class="lh"><b>List ${i + 1}</b><span class="la"><button type="button" data-a="up">&#9650;</button><button type="button" data-a="down">&#9660;</button><button type="button" data-a="del">&#10005;</button></span></div>
      <div class="f"><label>Entity</label><div class="ep" data-ep="${i}"></div></div>
      <div class="f"><label>Name</label><input type="text" data-f="name" placeholder="(entity name)"></div>
      <div class="f"><label>Icon</label><input type="text" data-f="icon" placeholder="mdi:cart-outline"></div>
    </div>`).join('');

    lists.forEach((l, i) => {
      const card = host.querySelector(`[data-i="${i}"]`);
      const epHost = card.querySelector(`[data-ep="${i}"]`);
      let picker;
      if (customElements.get('ha-entity-picker')) {
        picker = document.createElement('ha-entity-picker');
        picker.hass = this._hass;
        picker.value = l.entity || '';
        picker.includeDomains = ['todo'];
        picker.allowCustomEntity = true;
        picker.addEventListener('value-changed', (e) => { e.stopPropagation(); this._list(i, 'entity', e.detail.value || ''); });
      } else {
        picker = document.createElement('input');
        picker.type = 'text';
        picker.placeholder = 'todo.shopping_list';
        picker.value = l.entity || '';
        picker.addEventListener('input', (e) => this._list(i, 'entity', e.target.value));
      }
      epHost.appendChild(picker);
      this._pickers[i] = picker.tagName === 'HA-ENTITY-PICKER' ? picker : null;

      card.querySelector('[data-f="name"]').value = l.name || '';
      card.querySelector('[data-f="icon"]').value = l.icon || '';
      card.querySelector('[data-f="name"]').addEventListener('input', (e) => this._list(i, 'name', e.target.value));
      card.querySelector('[data-f="icon"]').addEventListener('input', (e) => this._list(i, 'icon', e.target.value));
      card.querySelector('[data-a="up"]').addEventListener('click', () => this._move(i, -1));
      card.querySelector('[data-a="down"]').addEventListener('click', () => this._move(i, 1));
      card.querySelector('[data-a="del"]').addEventListener('click', () => this._emit({ ...this._config, lists: this._config.lists.filter((_, x) => x !== i) }));
    });
  }

  _move(i, dir) {
    const lists = [...this._config.lists];
    const j = i + dir;
    if (j < 0 || j >= lists.length) return;
    [lists[i], lists[j]] = [lists[j], lists[i]];
    this._emit({ ...this._config, lists });
  }

  _patchLists(lists) {
    const host = this.shadowRoot.querySelector('.lh2');
    lists.forEach((l, i) => {
      const card = host.querySelector(`[data-i="${i}"]`);
      if (!card) return;
      const p = this._pickers[i];
      if (p) { p.hass = this._hass; if (p.value !== (l.entity || '')) p.value = l.entity || ''; }
      const n = card.querySelector('[data-f="name"]');
      const ic = card.querySelector('[data-f="icon"]');
      if (n.value !== (l.name || '')) n.value = l.name || '';
      if (ic.value !== (l.icon || '')) ic.value = l.icon || '';
    });
  }
}

customElements.define('bring-glass-card-editor', BringGlassCardEditor);
