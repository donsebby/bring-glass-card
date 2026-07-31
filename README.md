# Bring Glass Card

A frosted-glass tile view for Home Assistant todo lists — built for shopping lists, but it works with any `todo.*` entity (Bring!, Local To-do, Google Tasks, …).

Tap a tile to check an item off. Long-press it for quantity and details. Type in the field at the top to filter the list, hit Enter to add. Icons and colors come from the item name automatically, so a list of 20 items reads at a glance instead of being a wall of text.

Part of the Liquid Glass card family, alongside [liquid-glass-tile-card](https://github.com/donsebby/liquid-glass-tile-card) and [liquid-lens-navbar-card](https://github.com/donsebby/liquid-lens-navbar-card).

![demo](asset/bring-glass-card.png)

---

## Features

- **Tile grid** with automatic icons — 88 keyword rules covering groceries, drugstore, household, hardware and pet supplies, in German and English
- **Search built into the add field** — typing filters the visible tiles, Enter or `+` adds the text as a new item
- **No duplicates** — adding an item that already exists (including one that is already checked off) revives the existing entry instead of creating a second one
- **Quantity parsing** — `2 l milk` or `3x bread` splits into name and quantity, like the Bring app does
- **Multiple lists in one card**, switchable via tabs
- **Long-press sheet** for quantity, quick-pick chips and deleting an item
- **Theme-aware** — follows `--primary-text-color` and `--card-background-color`, so it works on light and dark themes
- **`frame: false`** for cards that already sit inside a glass container (Bubble Card popups and similar)
- **Fully translatable** via the `labels:` option

## Installation

### HACS (recommended)

1. HACS → three-dot menu → **Custom repositories**
2. Add `https://github.com/donsebby/bring-glass-card`, category **Dashboard**
3. Install **Bring Glass Card**, then reload your browser

### Manual

1. Copy `bring-glass-card.js` into `config/www/`
2. Settings → Dashboards → three-dot menu → **Resources** → add `/local/bring-glass-card.js` as **JavaScript module**

## Quick start

```yaml
type: custom:bring-glass-card
lists:
  - entity: todo.shopping_list
```

Two lists with tabs, dropped into a Bubble Card popup:

```yaml
type: custom:bring-glass-card
layout: kacheln
frame: false
lists:
  - entity: todo.groceries
    name: Groceries
    icon: mdi:cart-outline
  - entity: todo.drugstore
    name: Drugstore
    icon: mdi:bottle-tonic-outline
```

## Options

### Card

| Option | Type | Default | Description |
|---|---|---|---|
| `lists` | list | **required** | One or more entries, see below. `entity: todo.x` is accepted as shorthand for a single list. |
| `title` | string | list name | Heading. Falls back to the list's `name`, then the entity's friendly name. |
| `layout` | string | `kacheln` | `kacheln` (tiles), `kompakt` (smaller tiles), `zeilen` (rows: icon left, name right). |
| `frame` | bool | `true` | `false` removes the card's own background, border, blur and padding — use it inside another glass container. |
| `bg_opacity` | number | `0.7` | Opacity of the card background, `0`–`1`. No effect when `frame: false`. |
| `tile_radius` | number | `18` | Tile corner radius in px. |
| `tinted` | bool | `true` | Colored icons. `false` renders them in the theme's text color. |
| `glow` | bool | `true` | Tiles glow in the item color. |
| `show_done` | bool | `true` | Show the "recently done" section. |
| `done_expanded` | bool | `false` | Start with that section expanded. |
| `hide_add` | bool | `false` | Hide the add/search bar. |
| `hide_hint` | bool | `false` | Hide the hint line at the bottom. |
| `refresh_seconds` | number | `120` | Fallback poll interval. Description-only edits do not change the entity state, so this keeps a wall tablet in sync. |
| `default_icon` | string | `mdi:basket-outline` | Icon for items that match no rule. |
| `icons` | map | — | Custom keyword → icon mapping, see below. |
| `qty_chips` | list | `1 pc, 2 pcs, 500 g, 1 kg, 1 l, Organic` | Quick-pick chips in the detail sheet. |
| `labels` | map | English | Override any visible string, see below. |

### Per list

| Option | Type | Description |
|---|---|---|
| `entity` | string | **required**, must be a `todo.*` entity |
| `name` | string | Tab label and heading |
| `icon` | string | Icon shown on the tab |

### Custom icons

`icons:` is checked before the built-in rules. The key is matched as a substring against the normalized item name, so it is case- and umlaut-insensitive.

```yaml
icons:
  club mate: mdi:bottle-soda-classic
  dog food:
    icon: mdi:dog
    color: "#d9b45c"
```

### Translation

Every visible string can be overridden. `{n}` and `{list}` are placeholders.
`pcs` is the unit appended when an item is added as `3x bread`. A complete German set:

```yaml
labels:
  title: Einkaufsliste
  add: Artikel hinzufügen …
  open: "{n} offen"
  updated_now: gerade eben aktualisiert
  updated_min: vor {n} Min aktualisiert
  updated_hour: vor {n} Std aktualisiert
  updated_day: vor {n} Tg aktualisiert
  empty_title: Alles erledigt
  empty_text: Nichts mehr offen auf dieser Liste.
  search_title: Nichts gefunden
  search_text: Mit Enter oder + als neuen Artikel anlegen.
  loading: Liste wird geladen …
  done_title: Zuletzt erledigt
  hint: Tippen = abhaken · Lang drücken = Details & Menge
  sheet_on: auf {list}
  sheet_label: Menge / Spezifikation
  sheet_placeholder: z. B. 2 Liter
  delete: Löschen
  close: Fertig
  pcs: Stück
```

## How the icons are picked

1. `icons:` from your config — first match wins
2. The built-in rule table — 88 regular expressions, checked top to bottom
3. Fallback: `default_icon`, colored from a hash of the item name so the same item always keeps the same color

Matching runs against a normalized name: lower case, `ß` folded to `ss`, diacritics stripped, punctuation collapsed to spaces. `Käse`, `Kaese` and `kase` are therefore the same to the card, and so are `Toilet paper` and `toiletpaper`.

## Notes and limitations

- The card reads items via the `todo.get_items` action wrapped in `execute_script`, so it works across HA versions with the same call shape.
- A todo entity's state is its open-item count. Changes made elsewhere (the Bring app, another dashboard) therefore show up automatically; edits that only touch a description do not change the state and are picked up by the fallback poll.
- Items are compared by name, not by id, when deduplicating on add. `Cola` and `Cola Zero` are correctly treated as different items.
- The tile grid uses `align-items: start` on purpose — with `stretch`, WebKit derives the tile width from the stretched row height and the grid stops short of the right edge.

## License

MIT © donsebby
