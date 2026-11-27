# Artificial Analysis dashboards for TRMNL

A [TRMNL](https://trmnl.com) private plugin that shows [Artificial Analysis](https://artificialanalysis.ai) LLM leaderboards on e-ink. There is no server: TRMNL polls the AA API directly, and everything is rendered client-side.

| Board | Shows |
|---|---|
| **Intelligence** | Models ranked by the AA Intelligence Index |
| **Open Weights** | Open-weights models with their parameter counts |
| **Best Value** | Models close to the leader's score, cheapest first |
| **Fastest** | Capable models ranked by output speed |

All four TRMNL layouts are supported (full, half horizontal, half vertical, quadrant), in English or French.

## How it works

- **Data:** `GET https://artificialanalysis.ai/api/v2/language/models/free` with an `x-api-key` header. A free AA key is enough. The endpoint returns 200 models per page, so pages 1–3 are polled every 6 hours.
- **`src/transform.js`** (TRMNL Serverless) merges the pages, keeps the best-scoring variant of each model and trims the fields to stay under TRMNL's 100 KB payload limit.
- **`src/shared.liquid`** picks the board and renders the table. The free API tier does not say which models are open weights or how many parameters they have, so a curated snapshot and name-based rules fill that gap. You can add models with the *Extra open-weights models* setting.

## Settings

| Field | Default | |
|---|---|---|
| API Key | — | Create one at [artificialanalysis.ai/data-api](https://artificialanalysis.ai/data-api) |
| Dashboard | Intelligence | Which board this plugin shows |
| Language | English | English or French |
| Max closed models per lab | 2 | `0` disables the cap |
| Best value threshold (%) | 70 | Minimum share of the leader's index |
| Fastest threshold (%) | 50 | Minimum share of the leader's index |
| Extra open-weights models | — | Comma-separated model names |

## Development

Requires [trmnlp](https://github.com/usetrmnl/trmnlp), either with Docker or with `gem install trmnl_preview`.

```sh
AA_API_KEY=aa_... trmnlp serve   # live preview at http://localhost:4567
trmnlp lint
```

## Deploy

A private plugin holds a single set of settings, so each board is its own plugin on TRMNL. `bin/deploy` pushes `src/` to all four, keeping each plugin's name. The plugin IDs are listed in the script.

```sh
trmnlp login   # once, with your TRMNL user API key
bin/deploy
```

The API key and the *Dashboard* choice are set per plugin in the TRMNL web UI. They are not part of the source.
