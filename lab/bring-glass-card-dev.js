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
 * https://github.com/donsebby/bring-glass-card-dev
 * MIT licensed.
 */

const CARD_VERSION = "1.3.0-dev";
const DEFAULT_OVERRIDES_ENTITY = "todo.bring_glass_card_kategorien";
const COLLAPSE_KEY_PREFIX = "bgc-collapsed:";

const PALETTE = ["#a78bfa", "#d9b45c", "#5ec6c2", "#7bbf6a", "#5ea8d9", "#e0b84a", "#8a95a5", "#e07bc0"];

const CAT = { b: "#5ea8d9", g: "#7bbf6a", y: "#e0b84a", d: "#d9b45c", p: "#e07bc0", v: "#a78bfa", t: "#5ec6c2", s: "#8a95a5" };

// Einkaufskategorien, in Anzeige-Reihenfolge (angelehnt an einen typischen Supermarkt-Rundgang)
const GROUPS = [
  ["gemuese", "Obst & Gem\u00fcse", "mdi:food-apple"],
  ["brot", "Brot & Backwaren", "mdi:bread-slice"],
  ["milch", "Milchprodukte & Eier", "mdi:cheese"],
  ["fleisch", "Fleisch, Wurst & Fisch", "mdi:food-steak"],
  ["tiefkuehl", "S\u00fc\u00dfes & Tiefk\u00fchl", "mdi:ice-cream"],
  ["getraenke", "Getr\u00e4nke", "mdi:bottle-soda"],
  ["vorrat", "Vorrat & Gew\u00fcrze", "mdi:food-variant"],
  ["grill", "Grillbedarf", "mdi:grill"],
  ["drogerie", "Drogerie & Kosmetik", "mdi:bottle-tonic-outline"],
  ["haushalt", "Haushalt & Reinigung", "mdi:spray-bottle"],
  ["tier", "Tierbedarf", "mdi:paw"],
  ["sonstiges", "Sonstiges", "mdi:shape-outline"],
];
const GROUP_META = Object.fromEntries(GROUPS.map((g) => [g[0], { name: g[1], icon: g[2] }]));
const GROUP_ORDER = GROUPS.map((g) => g[0]);
const DEFAULT_GROUP = "sonstiges";

const CH = (c) => String.fromCharCode(c);
const ELL = CH(8230);
const MID = CH(183);
const SS = CH(223);

// Zeilenformat: regex=icon=farbcode=kategorie
const RULES_SRC = `
kuchenrolle|kuchenpapier|kuchentuch=paper-roll=s=haushalt
kartoffelsalat|nudelsalat|krautsalat|fleischsalat=bowl-mix=d=fleisch
cola|fanta|sprite|mezzo|spezi|limo|brause|eistee=bottle-soda=b=getraenke
wasser|sprudel|selters=water=b=getraenke
saft|nektar|smoothie|schorle|sirup=cup=y=getraenke
bier|radler|weizen=beer=y=getraenke
\\bwein|rotwein|weisswein|sekt|prosecco=glass-wine=p=getraenke
schnaps|likor|wodka|\\bgin\\b=bottle-wine=d=getraenke
kaffee|espresso|cappuccino=coffee=s=getraenke
tee\\b|teebeutel=tea=g=getraenke
kakao=cup=d=getraenke
milch=bottle-soda-classic=b=milch
kase|gouda|mozzarella|parmesan|feta|camembert|brie|tilsiter|butter|margarine=cheese=y=milch
sahne|schmand|fraiche|sauerrahm=bottle-soda-classic=b=milch
joghurt|jogurt|quark|skyr=cup=b=milch
eier|\\bei\\b=egg=y=milch
brotchen|semmel|toast|baguette|brot|brezel=bread-slice=d=brot
kuchen|\\btorte|muffin|geback|waffel=cake-variant=v=brot
mehl|hefe|backpulver=barley=d=vorrat
zucker|salz|pfeffer|gewurz|zimt=shaker-outline=s=vorrat
zitrone|limette|orange|mandarine=fruit-citrus=y=gemuese
erdbeer|beere|kirsch=fruit-cherries=p=gemuese
traube|rosine=fruit-grapes=v=gemuese
ananas|mango|kiwi|banane=fruit-pineapple=y=gemuese
melone=fruit-watermelon=g=gemuese
apfel|\\bbirne|pfirsich|pflaume|aprikose|obst=food-apple=g=gemuese
salat|spinat|rucola|weisskohl|rotkohl|brokkoli|blumenkohl|lauch|zucchini|aubergine|kurbis|bohnen|erbsen=leaf=g=gemuese
karotte|mohre|gemuse|gurke|sellerie=carrot=g=gemuese
paprika|chili=chili-mild=g=gemuese
tomate|ketchup=fruit-cherries=p=gemuese
zwiebel|knoblauch=food-variant=d=gemuese
kartoffel|pommes=french-fries=d=gemuese
pilz|champignon=mushroom=d=gemuese
\\bmais=corn=y=gemuese
hund=dog=d=tier
katze|streu=cat=d=tier
futter|leckerli|kaninchen|hamster=paw=d=tier
schnitzel|steak|gulasch|braten|filet|hack|rinder|schwein|lamm|kotelett|frikadelle|fleisch=food-steak=p=fleisch
wurst|salami|schinken|speck|bacon|aufschnitt=sausage=p=fleisch
pute|hahnchen|huhn|geflugel|ente=food-drumstick=p=fleisch
fisch|lachs|forelle|garnele|shrimp|hering=fish=b=fleisch
tofu|veggie|vegan=sprout=g=gemuese
grill|brikett|kohle|anzunder|feuerzeug=grill=y=grill
\\breis\\b|risotto=rice=d=vorrat
nudel|\\bpasta\\b|spaghetti|tortellini|ravioli|lasagne=pasta=d=vorrat
konserve|dose|linsen=food-variant=g=vorrat
\\bol\\b|olivenol|essig=oil=y=vorrat
honig|marmelade|konfiture|nutella|aufstrich=beehive-outline=y=vorrat
suppe|bruhe|fond|sosse|sauce|senf=bowl-mix=d=vorrat
musli|muesli|cornflakes|haferflocken=bowl-mix=d=vorrat
eis\\b|eiscreme=ice-cream=v=tiefkuehl
schoko|riegel|milka=cookie=d=tiefkuehl
keks|cookie|prinzenrolle=cookie=d=tiefkuehl
kaugummi|bonbon|lakritz|sussigkeit|haribo=candy=p=tiefkuehl
chips|pringel|cracker|popcorn|salzstange|nuss|mandel=popcorn=y=tiefkuehl
pudding|dessert=cup=v=tiefkuehl
zahn=toothbrush-paste=t=drogerie
dusch|schaumbad=shower-head=t=drogerie
shampoo|schampoo|spulung|conditioner|gliss|\\bkur\\b=bottle-tonic=t=drogerie
haarspray|deo=spray=t=drogerie
haar=hair-dryer=t=drogerie
seife|desinfekt=hand-wash=t=drogerie
lotion|creme|salbe|hirschtalg|balsam|nivea|penaten=lotion=t=drogerie
rasier|klingen=razor-double-edge=s=drogerie
make up|makeup|lippenstift|mascara|nagellack|schminke=lipstick=p=drogerie
parfum|eau de=spray=p=drogerie
watte=lotion=t=drogerie
tampon|binden|slipeinlage=water-outline=p=drogerie
windel|wickel|schnuller|\\bbaby=human-baby-changing-table=p=drogerie
milchpulver|folgemilch=baby-bottle=p=drogerie
toilettenpapier|klopapier|taschentuch|tempo|feuchttuch|serviette=paper-roll=s=haushalt
mullbeutel|gefrierbeutel|frischhaltefolie|alufolie|backpapier=trash-can-outline=s=haushalt
waschmittel|weichspuler|entkalker|fleckenentferner=washing-machine=t=haushalt
spulmittel|spultab|klarspuler|geschirrspul=dishwasher=t=haushalt
reiniger|putzmittel|allzweck|scheuermilch|\\bwc=spray-bottle=t=haushalt
schwamm|lappen|wischmop|besen|staubsaugerbeutel=broom=s=haushalt
kerze|teelicht|streichholz=candle=y=haushalt
batterie|\\bakku|knopfzelle=battery=s=haushalt
gluhbirne|leuchtmittel|lampe=lightbulb=y=haushalt
schraub|dubel|nagel|scharnier=screw-flat-top=s=sonstiges
werkzeug|hammer|zange|sage|bohrer=hammer-wrench=s=sonstiges
farbe|lack|pinsel|grundierung|spachtel=format-paint=t=sonstiges
kleb|silikon|panzertape=tools=s=sonstiges
pflanze|blume|samen|dunger=flower=g=sonstiges
heft|schreibblock|din a|stift|radiergummi|schere|ordner|papier=notebook=b=sonstiges
tablette|ibu|paracetamol|aspirin|momet|pflaster|verband|nasenspray|hustensaft|vitamin=medical-bag=p=drogerie
`;

const ICON_RULES = RULES_SRC.trim()
  .split("\n")
  .map((line) => {
    const t = line.split("=");
    return [new RegExp(t[0]), "mdi:" + t[1], CAT[t[2]] || CAT.s, t[3] || DEFAULT_GROUP];
  });

const COMBINING = new RegExp("[" + CH(768) + "-" + CH(879) + "]", "g");

const ADD_RE = new RegExp(
  "^(\\d+\\s*(?:x|st(?:" + CH(252) + "|u)ck|pc|pcs|kg|g|lb|oz|l|ml|pkg|pck|pack|dose|dosen|can|cans|bottles?|flaschen?)?\\.?)\\s+(.*)$",
  "i"
);

const norm = (e) =>
  String(e == null ? "" : e)
    .toLowerCase()
    .split(SS)
    .join("ss")
    .normalize("NFD")
    .replace(COMBINING, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// UI texts, picked by Home Assistant's language (German for "de", English
// otherwise). Any key can be overridden per card via `labels:`.
const LABELS_EN = {
  title: "Shopping list",
  add: "Add item",
  open: "{n} open",
  updated_now: "updated just now",
  updated_min: "updated {n} min ago",
  updated_hour: "updated {n} h ago",
  updated_day: "updated {n} d ago",
  empty_title: "All done",
  empty_text: "Nothing left on this list. Need something? Just type it above.",
  search_title: "No matches",
  search_text: "Press Enter or + to add it as a new item.",
  loading: `Loading list ${ELL}`,
  done_title: "Recently done",
  hint: `Tap to check off ${MID} long-press for details & quantity`,
  sheet_on: "on {list}",
  sheet_label: "Quantity / note",
  sheet_placeholder: "e.g. 2 litres",
  category: "Category",
  category_auto: "Automatic",
  delete: "Delete",
  pcs: "pcs",
  close: "Done",
};
const LABELS_DE = {
  title: "Einkaufsliste",
  add: "Artikel hinzuf\u00fcgen",
  open: "{n} offen",
  updated_now: "gerade aktualisiert",
  updated_min: "aktualisiert vor {n} Min",
  updated_hour: "aktualisiert vor {n} Std",
  updated_day: "aktualisiert vor {n} Tagen",
  empty_title: "Alles erledigt",
  empty_text: "Nichts mehr auf der Liste. Fehlt etwas? Einfach oben eintippen.",
  search_title: "Nichts gefunden",
  search_text: "Enter oder + f\u00fcgt es als neuen Artikel hinzu.",
  loading: `Liste wird geladen ${ELL}`,
  done_title: "Zuletzt erledigt",
  hint: `Tippen zum Abhaken ${MID} lange dr\u00fccken f\u00fcr Menge & Details`,
  sheet_on: "auf {list}",
  sheet_label: "Menge / Notiz",
  sheet_placeholder: "z. B. 2 Liter",
  category: "Kategorie",
  category_auto: "Automatisch",
  delete: "L\u00f6schen",
  pcs: "Stk",
  close: "Fertig",
};
const DEFAULT_CHIPS_EN = ["1 pc", "2 pcs", "500 g", "1 kg", "1 l", "Organic"];
const DEFAULT_CHIPS_DE = ["1 Stk", "2 Stk", "500 g", "1 kg", "1 l", "Bio"];
// English category names; the German ones live in GROUPS.
const GROUP_NAMES_EN = {
  gemuese: "Fruit & vegetables", brot: "Bread & bakery", milch: "Dairy & eggs", fleisch: "Meat, sausage & fish",
  tiefkuehl: "Sweets & frozen", getraenke: "Drinks", vorrat: "Pantry & spices", grill: "BBQ",
  drogerie: "Toiletries", haushalt: "Household & cleaning", tier: "Pets", sonstiges: "Other",
};

const LAYOUTS = {
  kacheln: { col: "122px", gap: "12px", dir: "column", pad: "15px 10px", minH: "134px", box: "68px", glyph: "36px", name: "13.5px", qty: "11.5px", ta: "center", text: "24px", sName: "15px", sQty: "13px" },
  kompakt: { col: "94px", gap: "8px", dir: "column", pad: "11px 6px", minH: "108px", box: "52px", glyph: "28px", name: "11.5px", qty: "10.5px", ta: "center", text: "32px", sName: "13px", sQty: "12px" },
  zeilen: { col: "236px", gap: "8px", dir: "row", pad: "11px 12px", minH: "0px", box: "48px", glyph: "26px", name: "13px", qty: "11.5px", ta: "left", text: "auto", sName: "15px", sQty: "13px" },
};

const STYLE = `
:host{display:block;font-family:var(--paper-font-body1_-_font-family,Roboto,Helvetica,Arial,sans-serif);--ink:var(--primary-text-color,#fff);--txt:var(--primary-text-color,rgba(255,255,255,0.95));--txt2:var(--secondary-text-color,rgba(255,255,255,0.55));--l7:color-mix(in srgb,var(--ink) 7%,transparent);--l12:color-mix(in srgb,var(--ink) 12%,transparent);--l13:color-mix(in srgb,var(--ink) 13%,transparent);--l26:color-mix(in srgb,var(--ink) 26%,rgba(255,255,255,0.5));--gbg:linear-gradient(155deg,rgba(255,255,255,0.5) 0%,rgba(255,255,255,0.22) 45%,rgba(255,255,255,0.4) 100%);--gsh:inset 0 1px 1px rgba(255,255,255,0.28),inset 2px 0 4px rgba(80,200,255,0.28),inset -2px 0 4px rgba(255,90,190,0.25)}
.card{box-sizing:border-box;background:color-mix(in oklch,var(--card-background-color,#17181f) var(--bg-pct,70%),transparent);backdrop-filter:var(--lg-backdrop,blur(22px) saturate(180%));-webkit-backdrop-filter:var(--lg-backdrop,blur(22px) saturate(180%));border:1px solid var(--l12);border-radius:var(--lg-radius,22px);padding:18px;box-shadow:0 20px 40px -20px rgba(0,0,0,0.35),inset 0 1px 0 var(--l12)}
.card.bare{background:none;backdrop-filter:none;-webkit-backdrop-filter:none;border:none;border-radius:0;padding:0;box-shadow:none}
.head{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}
.head-l{flex:1 1 auto;min-width:0}
.titles{display:flex;align-items:baseline;gap:8px;min-width:0}
.title{font-size:17px;font-weight:700;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.count{font-size:12px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--l13);color:var(--txt2);white-space:nowrap;flex:none}
.sub{font-size:11.5px;margin-top:3px;color:var(--txt2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tabs{display:flex;gap:6px;justify-content:flex-end;flex:none;margin-left:auto;max-width:100%;overflow-x:auto}
.tab{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:11px;cursor:pointer;user-select:none;white-space:nowrap;font-size:12px;font-weight:600;transition:background .15s ease;color:var(--txt2);background:transparent}
.tab ha-icon{--mdc-icon-size:15px}
.tab.on{color:var(--txt);background:var(--gbg);box-shadow:var(--gsh)}
.addbar{display:flex;gap:8px;margin-bottom:16px}
.addfield{flex:1;display:flex;align-items:center;gap:8px;padding:0 12px;border-radius:14px;background:var(--l7);border:1px solid var(--l12)}
.addfield ha-icon{--mdc-icon-size:18px;opacity:.45;color:var(--ink)}
.addfield input{flex:1;min-width:0;background:transparent;border:none;outline:none;padding:11px 0;font-family:inherit;font-size:14px;color:var(--txt)}
.addbtn{display:flex;align-items:center;justify-content:center;width:46px;border-radius:14px;cursor:pointer;color:var(--ink);border:1px solid var(--l26);background:var(--gbg);box-shadow:var(--gsh)}
.addbtn ha-icon{--mdc-icon-size:22px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--col),1fr));gap:var(--gap);align-items:start}
.tile{display:flex;flex-direction:var(--dir);align-items:center;justify-content:center;gap:10px;box-sizing:border-box;min-width:0;padding:var(--pad);min-height:var(--min-h);aspect-ratio:var(--ratio,auto);border-radius:var(--tile-radius,18px);cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;background:var(--l7);border:1px solid var(--l12);transition:transform .12s ease,background .15s ease,box-shadow .15s ease,opacity .15s ease}
.tile:active{transform:scale(0.96)}
.tile.glow{background:radial-gradient(120% 90% at 50% 0%,color-mix(in srgb,var(--c) 20%,transparent) 0%,transparent 72%),var(--l7);border:1px solid color-mix(in srgb,var(--c) 32%,var(--l12));box-shadow:0 8px 26px -12px color-mix(in srgb,var(--c) 70%,transparent),inset 0 0 22px -10px color-mix(in srgb,var(--c) 85%,transparent),inset 0 1px 0 color-mix(in srgb,var(--c) 22%,transparent)}
.box{width:var(--box);height:var(--box);flex:none;display:flex;align-items:center;justify-content:center;color:var(--ink);border:none;background:none;box-shadow:none;transition:filter .12s ease}
.box.tinted{color:color-mix(in srgb,var(--c) 82%,var(--ink));filter:drop-shadow(0 0 10px color-mix(in srgb,var(--c) 55%,transparent)) saturate(125%)}
.box ha-icon{--mdc-icon-size:var(--glyph)}
.text{min-width:0;text-align:var(--ta);width:var(--text-w,100%);min-height:var(--text-h);flex:var(--text-flex,0 1 auto)}
.name{font-size:var(--name);font-weight:600;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qty{font-size:var(--qty);margin-top:2px;color:var(--txt2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile.done,.tile.done.glow{background:transparent;border-style:dashed;box-shadow:none;border-color:var(--l13);opacity:.55}
.tile.done .box{filter:grayscale(1);opacity:.6}
.tile.done .name{text-decoration:line-through;color:var(--txt2)}
.tile.done .qty{opacity:.7}
.empty{display:flex;flex-direction:column;align-items:center;gap:10px;padding:46px 20px;text-align:center}
.empty.loading{opacity:.6;animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:.45}50%{opacity:.8}}
.empty-box{width:62px;height:62px;border-radius:20px;display:flex;align-items:center;justify-content:center;color:var(--ink);border:1px solid rgba(255,255,255,0.5);background:linear-gradient(155deg,rgba(123,191,106,0.5) 0%,rgba(255,255,255,0.12) 45%,rgba(123,191,106,0.5) 100%);box-shadow:inset 0 0 14px rgba(123,191,106,0.5),inset 0 1px 1px rgba(255,255,255,0.5),0 0 18px -2px rgba(123,191,106,0.6)}
.empty-box ha-icon{--mdc-icon-size:30px}
.empty-t{font-size:15px;font-weight:700;color:var(--txt)}
.empty-s{font-size:12.5px;max-width:280px;text-wrap:pretty;color:var(--txt2)}
.donesec{margin-top:16px;border-top:1px solid var(--l12);padding-top:12px}
.donehead{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;font-size:12.5px;font-weight:600;color:var(--txt2)}
.donehead ha-icon{--mdc-icon-size:18px}
.donehead .pill{padding:1px 7px;border-radius:999px;background:var(--l13)}
.donegrid{margin-top:12px}
.hint{font-size:11.5px;text-align:center;margin-top:14px;color:var(--txt2);opacity:.8}
.veil{position:fixed;inset:0;z-index:9;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(8,9,14,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.sheet{width:100%;max-width:380px;box-sizing:border-box;border-radius:24px;padding:22px;background:var(--card-background-color,#17181f);border:1px solid var(--l12);box-shadow:0 40px 70px -30px rgba(0,0,0,0.7)}
.sheet-head{display:flex;align-items:center;gap:14px}
.sheet-box{--box:62px;--glyph:30px}
.sheet-name{font-size:18px;font-weight:700;color:var(--txt)}
.sheet-sub{font-size:11.5px;margin-top:2px;color:var(--txt2)}
.label{font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;opacity:.45;margin:20px 0 8px;color:var(--ink)}
.sheet input{width:100%;box-sizing:border-box;padding:11px 13px;border-radius:14px;outline:none;font-family:inherit;font-size:14px;color:var(--txt);background:var(--l7);border:1px solid var(--l12)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.chip{padding:6px 11px;border-radius:999px;cursor:pointer;user-select:none;font-size:12px;color:var(--txt);background:var(--l7);border:1px solid var(--l12)}
.chip.active{color:var(--ink);background:var(--gbg);box-shadow:var(--gsh);border-color:transparent}
.sheet-actions{display:flex;gap:8px;margin-top:22px}
.btn-del{display:flex;align-items:center;justify-content:center;gap:6px;padding:12px 16px;border-radius:14px;cursor:pointer;user-select:none;font-size:13px;font-weight:600;color:#e07b7b;background:rgba(224,123,123,0.1);border:1px solid rgba(224,123,123,0.28)}
.btn-del ha-icon{--mdc-icon-size:17px}
.btn-ok{flex:1;display:flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:14px;cursor:pointer;user-select:none;font-size:13px;font-weight:700;color:var(--ink);border:1px solid var(--l26);background:var(--gbg);box-shadow:var(--gsh)}
.catsec{margin-bottom:18px}
.catsec:last-child{margin-bottom:0}
.cathead{display:flex;align-items:center;gap:7px;cursor:pointer;user-select:none;margin-bottom:10px;-webkit-tap-highlight-color:transparent}
.cathead ha-icon{--mdc-icon-size:16px;opacity:.6;color:var(--ink)}
.catname{font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--txt2);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.catcount{font-size:11px;font-weight:600;padding:1px 7px;border-radius:999px;background:var(--l13);color:var(--txt2);flex:none}
.catchev{opacity:.5}
/* look: solid - calm solid surfaces instead of glass (opt-in, the glass rules
   above stay untouched). No backdrop blur, gradients, glows or big shadows.
   Item colours only tint the icon circle (category hint), done items are
   neutral. The edit sheet lives in .veil-host next to .card, hence the
   ".card.solid + .veil-host" selectors. Kept last so these rules win. */
:host{--s-tile:var(--lg-tile-bg,color-mix(in srgb,var(--ink) 8%,transparent));--s-r:calc(var(--lg-radius,20px) - 4px)}
.card.solid{background:var(--surface,color-mix(in srgb,var(--card-background-color,#1c1f28) 88%,transparent));backdrop-filter:none;-webkit-backdrop-filter:none;border:1px solid rgba(255,255,255,0.06);border-radius:var(--lg-radius,20px);padding:16px;box-shadow:none}
.card.solid.bare{background:none;border:none;border-radius:0;padding:0}
.card.solid .title{font-size:15px;font-weight:600}
.card.solid .count{font-size:13px;font-weight:500;font-variant-numeric:tabular-nums}
.card.solid .sub{font-size:13px}
/* the 44px pill tabs are wider than the glass ones: on narrow cards they wrap
   below the title instead of squeezing it */
.card.solid .head{flex-wrap:wrap}
.card.solid .head-l{min-width:min(140px,100%)}
.card.solid .tabs{align-items:center}
.card.solid .tab{box-sizing:border-box;min-height:44px;padding:0 16px;border-radius:999px;font-size:15px;font-weight:500;transition:background .2s ease,color .2s ease}
.card.solid .tab ha-icon{--mdc-icon-size:18px}
.card.solid .tab.on{color:var(--txt);background:color-mix(in srgb,var(--ink) 14%,transparent);box-shadow:none}
.card.solid .addbar{align-items:center}
.card.solid .addfield{box-sizing:border-box;min-height:44px;border-radius:14px;background:color-mix(in srgb,var(--ink) 8%,transparent);border:1px solid rgba(255,255,255,0.08)}
.card.solid .addfield ha-icon{opacity:1;color:var(--txt2)}
.card.solid .addfield input{font-size:15px}
.card.solid .addbtn{flex:none;width:44px;height:44px;border-radius:999px;border:none;color:var(--txt);background:color-mix(in srgb,var(--ink) 14%,transparent);box-shadow:none;transition:background .2s ease}
/* min-height:0 - with the 36px icon circle the content fits a square tile; the
   layout's min-height would (via aspect-ratio) widen tiles past their column. */
.card.solid .tile{min-height:0;background:var(--s-tile);border:1px solid rgba(255,255,255,0.04);border-radius:var(--s-tile-r,var(--s-r));box-shadow:none;transition:transform .12s ease,background .2s ease,opacity .2s ease}
.card.solid .box{width:36px;height:36px;border-radius:50%;background:color-mix(in srgb,var(--ink) 10%,transparent);color:var(--txt);filter:none;transition:background .2s ease,color .2s ease}
.card.solid .box ha-icon{--mdc-icon-size:20px}
.card.solid .box.tinted{background:color-mix(in srgb,var(--c) 20%,transparent);color:var(--c);filter:none}
.card.solid .name{font-size:var(--s-name,15px);font-weight:600}
.card.solid .qty{font-size:var(--s-qty,13px);font-variant-numeric:tabular-nums}
.card.solid .tile.done{background:var(--s-tile);border:1px solid rgba(255,255,255,0.04);box-shadow:none;opacity:.6}
.card.solid .tile.done .box{filter:none;opacity:1;color:var(--txt2)}
.card.solid .tile.done .qty{opacity:1}
.card.solid .empty-box{width:56px;height:56px;border-radius:50%;border:none;color:var(--txt2);background:color-mix(in srgb,var(--ink) 10%,transparent);box-shadow:none}
.card.solid .empty-box ha-icon{--mdc-icon-size:28px}
.card.solid .empty-t{font-size:15px;font-weight:600}
.card.solid .empty-s{font-size:13px}
.card.solid .donesec{border-top-color:rgba(255,255,255,0.06)}
.card.solid .donehead,.card.solid .cathead{position:relative}
.card.solid .donehead{font-size:13px}
.card.solid .donehead::before{content:"";position:absolute;left:0;right:0;top:-12px;bottom:-14px}
.card.solid .donegrid{margin-top:14px}
.card.solid .donehead .pill,.card.solid .catcount{font-size:13px;font-weight:500;padding:1px 8px;font-variant-numeric:tabular-nums}
.card.solid .cathead::before{content:"";position:absolute;left:0;right:0;top:-16px;bottom:-10px}
.card.solid .cathead ha-icon{opacity:1;color:var(--txt2)}
.card.solid .catname{font-size:13px;font-weight:600;letter-spacing:0;text-transform:none}
.card.solid .hint{font-size:13px;opacity:1}
.card.solid + .veil-host .veil{background:rgba(8,9,14,0.72);backdrop-filter:none;-webkit-backdrop-filter:none}
.card.solid + .veil-host .sheet{max-height:calc(100vh - 40px);overflow-y:auto;border-radius:var(--lg-radius,20px);background:var(--surface,color-mix(in srgb,var(--card-background-color,#1c1f28) 88%,transparent));border:1px solid rgba(255,255,255,0.06);box-shadow:none}
.card.solid + .veil-host .box{width:48px;height:48px;border-radius:50%;background:color-mix(in srgb,var(--ink) 10%,transparent);color:var(--txt);filter:none}
.card.solid + .veil-host .box ha-icon{--mdc-icon-size:24px}
.card.solid + .veil-host .box.tinted{background:color-mix(in srgb,var(--c) 20%,transparent);color:var(--c);filter:none}
.card.solid + .veil-host .sheet-name{font-size:15px;font-weight:600}
.card.solid + .veil-host .sheet-sub{font-size:13px}
.card.solid + .veil-host .label{font-size:13px;font-weight:600;letter-spacing:0;text-transform:none;opacity:1;color:var(--txt2)}
.card.solid + .veil-host .sheet input{min-height:44px;font-size:15px;border-radius:14px;background:color-mix(in srgb,var(--ink) 8%,transparent);border:1px solid rgba(255,255,255,0.08)}
.card.solid + .veil-host .chip{box-sizing:border-box;display:flex;align-items:center;min-height:44px;padding:0 14px;font-size:15px;color:var(--txt);background:var(--s-tile);border:1px solid rgba(255,255,255,0.04);border-radius:var(--s-r);transition:background .2s ease}
.card.solid + .veil-host .chip.active{background:color-mix(in srgb,var(--c,var(--ink)) 20%,var(--s-tile));border-color:rgba(255,255,255,0.04);box-shadow:none}
.card.solid + .veil-host .sheet-actions{align-items:center}
.card.solid + .veil-host .btn-del,.card.solid + .veil-host .btn-ok{box-sizing:border-box;min-height:44px;padding:0 18px;border-radius:999px;border:none;box-shadow:none;font-size:15px;font-weight:500;background:color-mix(in srgb,var(--ink) 14%,transparent)}
.card.solid + .veil-host .btn-ok{color:var(--txt)}
@media (prefers-reduced-motion: reduce){
.card.solid .tile,.card.solid .tab,.card.solid .box,.card.solid .addbtn,.card.solid + .veil-host .chip{transition:none}
.card.solid .tile:active{transform:none}
.card.solid .empty.loading{animation:none}
}
`;

const esc = (e) =>
  String(e == null ? "" : e).replace(/[&<>"]/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[e]));

const emptyHtml = (icon, title, sub, extraClass) => `
  <div class="empty${extraClass || ""}">
    <div class="empty-box"><ha-icon icon="mdi:${icon}"></ha-icon></div>
    <div class="empty-t">${esc(title)}</div>
    ${sub ? `<div class="empty-s">${esc(sub)}</div>` : ""}
  </div>
`;

// Style from the theme: `--lg-look` (solid | glass, quotes tolerated) decides
// for all Liquid Glass cards; `look:` in the card config overrides it.
const themeLook = (el) => {
  let v = "";
  try {
    v = getComputedStyle(el).getPropertyValue("--lg-look") || "";
  } catch (err) {
    /* not rendered yet */
  }
  v = v.trim().replace(/^["']|["']$/g, "").trim().toLowerCase();
  return v === "solid" || v === "glass" ? v : "";
};

class BringGlassCard extends HTMLElement {
  setConfig(config) {
    const lists = config.lists || (config.entity ? [{ entity: config.entity }] : null);
    if (!lists || !lists.length) throw new Error("bgc: lists required");
    lists.forEach((l) => {
      if (!l.entity || !l.entity.startsWith("todo.")) throw new Error("bgc: todo.* required");
    });
    this._config = { ...config, lists };
    this._l = { ...(config.labels || {}) };
    this._metaCache = {};
    this._active = 0;
    this._items = {};
    this._loaded = {};
    this._q = "";
    this._doneOpen = !!config.done_expanded;
    this._collapsedKey = COLLAPSE_KEY_PREFIX + lists.map((l) => l.entity).join(",");
    this._collapsed = this._loadCollapsed();
    this._overrides = {};
    this._sheet = null;
    this._build();
    // look: solid is opt-in (card config or theme variable --lg-look);
    // anything else keeps the glass look untouched.
    this._look = this._effectiveLook();
    this._cardEl.classList.toggle("solid", this._isSolid());
    this._applyLayout();
    this._render();
    this._fetchAll();
  }

  _isSolid() {
    return this._look === "solid";
  }

  _configLook() {
    const look = this._config?.look;
    return look === "solid" || look === "glass" ? look : "";
  }

  _effectiveLook() {
    return this._configLook() || themeLook(this) || "glass";
  }

  // Re-read --lg-look (only when the card config has no `look`). If the
  // effective look changed, update like a fresh setConfig with the same config
  // would (class, layout variables, tiles without glows), keeping state.
  _checkLook() {
    if (!this._config || !this._cardEl || this._configLook()) return;
    const look = this._effectiveLook();
    if (look === this._look) return;
    this._look = look;
    this._cardEl.classList.toggle("solid", this._isSolid());
    this._applyLayout();
    this._render();
  }

  _loadCollapsed() {
    try {
      const raw = window.localStorage.getItem(this._collapsedKey);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (err) {
      return new Set();
    }
  }

  _saveCollapsed() {
    try {
      window.localStorage.setItem(this._collapsedKey, JSON.stringify([...this._collapsed]));
    } catch (err) {
      /* private browsing / storage disabled - collapse state just won't persist */
    }
  }

  _overridesEntity() {
    return this._config.overrides_entity || DEFAULT_OVERRIDES_ENTITY;
  }

  _rebuildOverrides() {
    const items = this._items[this._overridesEntity()] || [];
    const map = {};
    items.forEach((it) => {
      const group = (it.description || "").trim();
      if (group) map[it.summary] = { group, uid: it.uid };
    });
    this._overrides = map;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (!this._config) return;
    const sig = this._config.lists
      .map((l) => {
        const st = hass.states[l.entity];
        return st ? `${l.entity}:${st.state}:${st.last_changed}` : `${l.entity}:-`;
      })
      .join("|");
    const changed = sig !== this._sig;
    if (changed) this._sig = sig;
    // Theme switched (or dark mode toggled): re-read --lg-look. Not on every tick.
    const th = hass.themes;
    if (th !== this._themesRef || th?.theme !== this._themeName || th?.darkMode !== this._themeDark) {
      this._themesRef = th;
      this._themeName = th?.theme;
      this._themeDark = th?.darkMode;
      if (!first) this._checkLook();
    }
    if (first) {
      this._checkLook();
      this._render();
    }
    if (changed) this._fetchAll();
  }

  connectedCallback() {
    clearInterval(this._poll);
    this._poll = setInterval(() => this._fetchAll(), 1000 * (this._config?.refresh_seconds || 120));
    if (!this._onThemeChanged) this._onThemeChanged = () => this._checkLook();
    window.addEventListener("lg-theme-changed", this._onThemeChanged);
    this._checkLook();
    // The theme may only apply after the card is attached.
    cancelAnimationFrame(this._lookFrame);
    this._lookFrame = requestAnimationFrame(() => this._checkLook());
  }

  disconnectedCallback() {
    clearInterval(this._poll);
    clearTimeout(this._pressTimer);
    cancelAnimationFrame(this._lookFrame);
    if (this._onThemeChanged) window.removeEventListener("lg-theme-changed", this._onThemeChanged);
  }

  getCardSize() {
    return 6;
  }

  _de() {
    const h = this._hass;
    return String((h && ((h.locale && h.locale.language) || h.language)) || "en").toLowerCase().startsWith("de");
  }

  _groupName(id) {
    const meta = GROUP_META[id] || GROUP_META[DEFAULT_GROUP];
    return this._de() ? meta.name : GROUP_NAMES_EN[id] || meta.name;
  }

  _t(key, vars) {
    let s = this._l[key] != null ? this._l[key] : (this._de() ? LABELS_DE : LABELS_EN)[key] || "";
    if (vars) for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(vars[k]);
    return s;
  }

  _timeAgo(ts) {
    if (!ts) return "";
    const min = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    if (min < 1) return this._t("updated_now");
    if (min < 60) return this._t("updated_min", { n: min });
    const hrs = Math.round(min / 60);
    return hrs < 24 ? this._t("updated_hour", { n: hrs }) : this._t("updated_day", { n: Math.round(hrs / 24) });
  }

  _list(i) {
    const lists = this._config.lists;
    return lists[Math.min(i === undefined ? this._active : i, lists.length - 1)] || lists[0];
  }

  _entity(i) {
    return this._list(i).entity;
  }

  async _fetchAll() {
    if (!this._hass || !this._config) return;
    const entities = [...this._config.lists.map((l) => l.entity), this._overridesEntity()];
    await Promise.all(entities.map((e) => this._fetch(e)));
    this._rebuildOverrides();
    this._render();
  }

  async _fetch(entity) {
    try {
      const res = await this._hass.callWS({
        type: "execute_script",
        sequence: [
          { service: "todo.get_items", data: { status: ["needs_action", "completed"] }, target: { entity_id: entity }, response_variable: "r" },
          { stop: "", response_variable: "r" },
        ],
      });
      this._items[entity] = res?.response?.[entity]?.items || [];
    } catch (err) {
      console.error("bring-glass-card-dev: get_items failed", err);
      this._items[entity] = this._items[entity] || [];
    }
    this._loaded[entity] = true;
  }

  _call(service, data) {
    return this._hass
      .callService("todo", service, data, { entity_id: this._entity() })
      .then(() => this._fetch(this._entity()))
      .then(() => this._render());
  }

  _haptic(kind) {
    this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: kind }));
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(kind === "medium" ? 14 : 8);
  }

  _meta(item) {
    const key = norm(item.summary);
    const cache = this._metaCache || (this._metaCache = {});
    let base = cache[key];
    if (!base) {
      base = this._resolveMeta(key);
      cache[key] = base;
    }
    const override = this._overrides && this._overrides[key];
    return override ? { ...base, group: override.group } : base;
  }

  _resolveMeta(normalized) {
    const overrides = this._config.icons || {};
    for (const key of Object.keys(overrides)) {
      if (normalized.includes(norm(key))) {
        const v = overrides[key];
        if (typeof v === "string") return { icon: v, color: this._hashColor(normalized), group: DEFAULT_GROUP };
        return { icon: v.icon, color: v.color || this._hashColor(normalized), group: v.group || DEFAULT_GROUP };
      }
    }
    const rule = ICON_RULES.find((r) => r[0].test(normalized));
    if (rule) return { icon: rule[1], color: rule[2], group: rule[3] };
    return { icon: this._config.default_icon || "mdi:basket-outline", color: this._hashColor(normalized), group: this._config.default_group || DEFAULT_GROUP };
  }

  _hashColor(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (31 * h + s.charCodeAt(i)) % 997;
    return PALETTE[h % PALETTE.length];
  }

  _build() {
    if (this._built) return;
    this._built = true;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="card"></div><div class="veil-host"></div>`;
    this._cardEl = this.shadowRoot.querySelector(".card");
    this._veilHost = this.shadowRoot.querySelector(".veil-host");

    this.shadowRoot.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab]");
      if (tab) {
        this._active = Number(tab.dataset.tab);
        this._sheet = null;
        this._render();
        this._fetch(this._entity()).then(() => this._render());
        return;
      }
      if (e.target.closest("[data-done-head]")) {
        this._doneOpen = !this._doneOpen;
        this._render();
        return;
      }
      const cat = e.target.closest("[data-cat-toggle]");
      if (cat) {
        const id = cat.dataset.catToggle;
        if (this._collapsed.has(id)) this._collapsed.delete(id);
        else this._collapsed.add(id);
        this._saveCollapsed();
        this._render();
        return;
      }
      const catChip = e.target.closest("[data-cat]");
      if (catChip) {
        const gid = catChip.dataset.cat;
        this._setCategoryOverride(gid === "_auto" ? null : gid);
        return;
      }
      if (e.target.closest("[data-add]")) {
        this._addFromInput();
        return;
      }
      if (e.target.closest("[data-sheet-close]")) {
        this._sheet = null;
        this._renderSheet();
        return;
      }
      if (e.target.closest("[data-sheet-del]")) {
        const uid = this._sheet;
        this._sheet = null;
        this._renderSheet();
        this._call("remove_item", { item: uid });
        return;
      }
      const chip = e.target.closest("[data-chip]");
      if (chip) {
        this._saveQty(chip.dataset.chip);
        return;
      }
      if (!e.target.closest(".sheet") && e.target.closest(".veil")) {
        this._sheet = null;
        this._renderSheet();
      }
    });

    this.shadowRoot.addEventListener("keydown", (e) => {
      if (e.target.matches("[data-input]") && e.key === "Enter") this._addFromInput();
    });

    this.shadowRoot.addEventListener("input", (e) => {
      if (e.target.matches("[data-input]")) {
        this._q = e.target.value;
        this._renderList();
      }
    });

    this.shadowRoot.addEventListener("contextmenu", (e) => {
      if (e.target.closest("[data-uid]")) e.preventDefault();
    });

    this.shadowRoot.addEventListener("pointerdown", (e) => {
      const tile = e.target.closest("[data-uid]");
      if (!tile) return;
      this._long = false;
      clearTimeout(this._pressTimer);
      const uid = tile.dataset.uid;
      this._pressTimer = setTimeout(() => {
        this._long = true;
        this._haptic("medium");
        this._sheet = uid;
        this._renderSheet();
      }, 420);
    });

    this.shadowRoot.addEventListener("pointerup", (e) => {
      const tile = e.target.closest("[data-uid]");
      clearTimeout(this._pressTimer);
      if (tile && !this._long) {
        this._haptic("light");
        this._call("update_item", { item: tile.dataset.uid, status: tile.dataset.done === "1" ? "needs_action" : "completed" });
      }
    });

    this.shadowRoot.addEventListener("pointercancel", () => clearTimeout(this._pressTimer));
    this.shadowRoot.addEventListener("pointerleave", () => clearTimeout(this._pressTimer), true);
  }

  _applyLayout() {
    const config = this._config;
    const layout = LAYOUTS[config.layout] || LAYOUTS.kacheln;
    const style = this.style;
    style.setProperty("--col", layout.col);
    style.setProperty("--gap", layout.gap);
    style.setProperty("--dir", layout.dir);
    style.setProperty("--pad", layout.pad);
    style.setProperty("--min-h", layout.minH);
    style.setProperty("--box", layout.box);
    style.setProperty("--glyph", layout.glyph);
    style.setProperty("--name", layout.name);
    style.setProperty("--qty", layout.qty);
    style.setProperty("--ta", layout.ta);
    style.setProperty("--text-h", layout.text === "auto" ? "0px" : layout.text);
    style.setProperty("--text-w", layout.dir === "row" ? "auto" : "100%");
    style.setProperty("--text-flex", layout.dir === "row" ? "1" : "0 1 auto");
    style.setProperty("--ratio", layout.dir === "row" ? "auto" : "1 / 1");
    style.setProperty("--tile-radius", (config.tile_radius != null ? config.tile_radius : 18) + "px");
    // look: solid - layout-specific text sizes and an explicit tile_radius;
    // only set in solid mode so the glass card's inline style stays as before.
    if (this._isSolid()) {
      style.setProperty("--s-name", layout.sName);
      style.setProperty("--s-qty", layout.sQty);
      if (config.tile_radius != null) style.setProperty("--s-tile-r", config.tile_radius + "px");
      else style.removeProperty("--s-tile-r");
    } else {
      ["--s-name", "--s-qty", "--s-tile-r"].forEach((p) => style.removeProperty(p));
    }
    this._cardEl.classList.toggle("bare", config.frame === false);
    if (config.bg_opacity != null) this._cardEl.style.setProperty("--bg-pct", Math.max(0, Math.min(100, 100 * config.bg_opacity)) + "%");
    else this._cardEl.style.removeProperty("--bg-pct");
  }

  _tileHtml(item, done) {
    const meta = this._meta(item);
    const tinted = this._config.tinted !== false && !done;
    // The solid look has no glows, whatever `glow` says.
    const glow = this._config.glow !== false && !done && !this._isSolid();
    const desc = (item.description || "").trim();
    return `
      <div class="tile${done ? " done" : ""}${glow ? " glow" : ""}" data-uid="${esc(item.uid)}" data-done="${done ? 1 : 0}" style="--c:${meta.color}">
        <div class="box${tinted ? " tinted" : ""}"><ha-icon icon="${esc(meta.icon)}"></ha-icon></div>
        <div class="text">
          <div class="name">${esc(item.summary)}</div>
          ${desc ? `<div class="qty">${esc(desc)}</div>` : ""}
        </div>
      </div>
    `;
  }

  _catSectionHtml(id, items) {
    const meta = GROUP_META[id] || GROUP_META[DEFAULT_GROUP];
    const collapsed = this._collapsed.has(id);
    return `
      <div class="catsec">
        <div class="cathead" data-cat-toggle="${esc(id)}">
          <ha-icon icon="${meta.icon}"></ha-icon>
          <span class="catname">${esc(this._groupName(id))}</span>
          <span class="catcount">${items.length}</span>
          <ha-icon class="catchev" icon="mdi:chevron-${collapsed ? "right" : "down"}"></ha-icon>
        </div>
        ${collapsed ? "" : `<div class="grid catgrid">${items.map((it) => this._tileHtml(it, false)).join("")}</div>`}
      </div>
    `;
  }

  _renderList() {
    if (!this._config || !this._cardEl) return;
    const config = this._config;
    const list = this._list();
    const items = this._items[list.entity] || [];
    const q = norm(this._q);
    const matches = (it) => !q || norm(it.summary + " " + (it.description || "")).includes(q);
    const open = items.filter((it) => it.status !== "completed" && matches(it));
    const done = items.filter((it) => it.status === "completed" && matches(it));

    const groupOn = config.group_by_category !== false;
    let openHtml;
    if (!open.length) {
      openHtml = q
        ? emptyHtml("magnify", this._t("search_title"), this._t("search_text"))
        : this._loaded[list.entity]
        ? emptyHtml("check-all", this._t("empty_title"), this._t("empty_text"))
        : emptyHtml("cart-outline", this._t("loading"), "", " loading");
    } else if (groupOn) {
      const buckets = {};
      open.forEach((it) => {
        const gid = this._meta(it).group || DEFAULT_GROUP;
        (buckets[gid] = buckets[gid] || []).push(it);
      });
      openHtml = GROUP_ORDER.filter((gid) => buckets[gid] && buckets[gid].length)
        .map((gid) => this._catSectionHtml(gid, buckets[gid]))
        .join("");
    } else {
      openHtml = `<div class="grid">${open.map((it) => this._tileHtml(it, false)).join("")}</div>`;
    }

    const doneHtml =
      config.show_done !== false && done.length
        ? `
          <div class="donesec">
            <div class="donehead" data-done-head>
              <ha-icon icon="mdi:chevron-${this._doneOpen ? "down" : "right"}"></ha-icon>
              <span>${esc(this._t("done_title"))}</span><span class="pill">${done.length}</span>
            </div>
            ${this._doneOpen ? `<div class="grid donegrid">${done.map((it) => this._tileHtml(it, true)).join("")}</div>` : ""}
          </div>
        `
        : "";

    const countEl = this._cardEl.querySelector("[data-count]");
    if (countEl) countEl.textContent = this._t("open", { n: open.length });
    const bodyEl = this._cardEl.querySelector("[data-body]");
    if (bodyEl) bodyEl.innerHTML = openHtml + doneHtml;
  }

  _render() {
    if (!this._hass || !this._config || !this._cardEl) return;
    const config = this._config;
    const list = this._list();
    const state = this._hass.states[list.entity];
    const input = this._cardEl.querySelector("[data-input]");
    if (input && this.shadowRoot.activeElement === input) {
      this._renderList();
      this._renderSheet();
      return;
    }
    const title = config.title || list.name || state?.attributes?.friendly_name || this._t("title");
    const tabsHtml =
      config.lists.length > 1
        ? `<div class="tabs">${config.lists
            .map((l, i) => {
              const st = this._hass.states[l.entity];
              const name = l.name || st?.attributes?.friendly_name || l.entity;
              return `<div class="tab${i === this._active ? " on" : ""}" data-tab="${i}">${l.icon ? `<ha-icon icon="${esc(l.icon)}"></ha-icon>` : ""}${esc(name)}</div>`;
            })
            .join("")}</div>`
        : "";
    const addBarHtml = config.hide_add
      ? ""
      : `
        <div class="addbar">
          <div class="addfield"><ha-icon icon="mdi:magnify"></ha-icon><input data-input type="text" value="${esc(this._q)}" placeholder="${esc(this._t("add"))}"></div>
          <div class="addbtn" data-add><ha-icon icon="mdi:plus"></ha-icon></div>
        </div>
      `;
    this._cardEl.innerHTML = `
      <div class="head">
        <div class="head-l">
          <div class="titles"><div class="title">${esc(title)}</div><div class="count" data-count></div></div>
          <div class="sub">${esc(this._timeAgo(state?.last_changed))}</div>
        </div>
        ${tabsHtml}
      </div>
      ${addBarHtml}
      <div data-body></div>
      ${config.hide_hint ? "" : `<div class="hint">${esc(this._t("hint"))}</div>`}
    `;
    this._renderList();
    this._renderSheet();
  }

  _renderSheet() {
    const items = this._items[this._entity()] || [];
    const item = this._sheet ? items.find((it) => it.uid === this._sheet) : null;
    if (!item) {
      this._veilHost.innerHTML = "";
      return;
    }
    const meta = this._meta(item);
    const override = this._overrides && this._overrides[norm(item.summary)];
    const tinted = this._config.tinted !== false;
    const chips = this._config.qty_chips || (this._de() ? DEFAULT_CHIPS_DE : DEFAULT_CHIPS_EN);
    const listName = this._list().name || this._entity();
    // look: solid - the selected category chip is tinted with the item colour.
    const sheetStyle = this._isSolid() && tinted ? ` style="--c:${meta.color}"` : "";
    this._veilHost.innerHTML = `
      <div class="veil">
        <div class="sheet"${sheetStyle}>
          <div class="sheet-head">
            <div class="box sheet-box${tinted ? " tinted" : ""}" style="--c:${meta.color}"><ha-icon icon="${esc(meta.icon)}"></ha-icon></div>
            <div style="min-width:0">
              <div class="sheet-name">${esc(item.summary)}</div>
              <div class="sheet-sub">${esc(this._t("sheet_on", { list: listName }))}</div>
            </div>
          </div>
          <div class="label">${esc(this._t("sheet_label"))}</div>
          <input data-qty type="text" placeholder="${esc(this._t("sheet_placeholder"))}" value="${esc(item.description || "")}">
          <div class="chips">${chips.map((c) => `<div class="chip" data-chip="${esc(c)}">${esc(c)}</div>`).join("")}</div>
          <div class="label">${esc(this._t("category"))}</div>
          <div class="chips">
            <div class="chip cat${override ? "" : " active"}" data-cat="_auto">${esc(this._t("category_auto"))}</div>
            ${GROUPS.map((g) => `<div class="chip cat${meta.group === g[0] ? " active" : ""}" data-cat="${g[0]}">${esc(this._groupName(g[0]))}</div>`).join("")}
          </div>
          <div class="sheet-actions">
            <div class="btn-del" data-sheet-del><ha-icon icon="mdi:trash-can-outline"></ha-icon>${esc(this._t("delete"))}</div>
            <div class="btn-ok" data-sheet-close>${esc(this._t("close"))}</div>
          </div>
        </div>
      </div>
    `;
    const qtyInput = this._veilHost.querySelector("[data-qty]");
    qtyInput.addEventListener("change", () => this._saveQty(qtyInput.value));
    qtyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this._saveQty(qtyInput.value);
        this._sheet = null;
        this._renderSheet();
      }
    });
  }

  _saveQty(value) {
    const uid = this._sheet;
    if (!uid) return;
    const qtyInput = this._veilHost.querySelector("[data-qty]");
    if (qtyInput) qtyInput.value = value;
    this._call("update_item", { item: uid, description: value });
  }

  _setCategoryOverride(groupId) {
    const uid = this._sheet;
    if (!uid) return;
    const items = this._items[this._entity()] || [];
    const item = items.find((it) => it.uid === uid);
    if (!item) return;
    const key = norm(item.summary);
    const existing = (this._overrides || {})[key];
    const oe = this._overridesEntity();
    this._haptic("light");
    let action;
    if (groupId === null) {
      if (!existing) return;
      action = this._hass.callService("todo", "remove_item", { item: existing.uid }, { entity_id: oe });
    } else if (existing) {
      action = this._hass.callService("todo", "update_item", { item: existing.uid, description: groupId }, { entity_id: oe });
    } else {
      action = this._hass.callService("todo", "add_item", { item: key, description: groupId }, { entity_id: oe });
    }
    action
      .then(() => this._fetch(oe))
      .then(() => {
        this._rebuildOverrides();
        this._renderSheet();
      })
      .catch((err) => {
        console.error(`bring-glass-card-dev: couldn't save category override - does the "${oe}" todo list entity exist? (see README: overrides_entity)`, err);
      });
  }

  _addFromInput() {
    const input = this._cardEl.querySelector("[data-input]");
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;
    input.value = "";
    this._q = "";
    const m = ADD_RE.exec(raw);
    const qty = m ? m[1].replace(/\s*x$/i, " " + this._t("pcs")).trim() : "";
    const name = m ? m[2] : raw;
    this._haptic("light");
    const key = norm(name);
    const existing = (this._items[this._entity()] || []).find((it) => norm(it.summary) === key);
    if (existing) {
      const data = { item: existing.uid, status: "needs_action" };
      if (qty) data.description = qty;
      return this._call("update_item", data);
    }
    this._call("add_item", { item: name.charAt(0).toUpperCase() + name.slice(1), description: qty || undefined });
  }
}

if (!customElements.get('bring-glass-card-dev')) customElements.define('bring-glass-card-dev', BringGlassCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "bring-glass-card-dev",
  name: "Bring Glass Card",
  description: "Glassmorphism tile view for Bring! (or any todo-based) shopping lists, with automatic supermarket-style categorization, collapsible/auto-hiding category sections, manual category overrides, swipeable multi-list tabs, and a long-press edit sheet for quantities.",
});
