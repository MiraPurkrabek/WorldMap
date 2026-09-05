# Imported visits

All demo visits were replaced with the user's list. The result contains **105
distinct places**, with **82 visited by Blue**, **59 visited by Red**, and **36
shared places**. The 29 entries in `together` are automatically included in both
colours. Faak am See retains two separate visits, in 2023 and 2024.

## Dates

No exact day or missing year was invented.

| Supplied information | Stored value | Popup |
| --- | --- | --- |
| November 2023 | `"2023-11"` | Nov 2023 |
| 2024 | `"2024"` | 2024 |
| Jan–Mar 2026 | `{"from":"2026-01","to":"2026-03"}` | Jan–Mar 2026 |
| Ljubljana, 2018/2019 | `{"oneOf":["2018","2019"]}` | 2018 or 2019 |
| No date supplied | `null` | Date not specified |

The ambiguous Ljubljana year is preserved as uncertainty, not assumed to be two
visits. If you meant both years, replace it with two entries.

## Name cleanup

Repeated Brussels / Brusel / Brusslles entries and repeated Tübingen entries
were merged within each colour; known dates were retained. The same place can
still have different dates for Blue and Red.

| Original spelling | Map name |
| --- | --- |
| Mt. Kedar Kanthal | Kedarkantha, India — confirmed by the user |
| Puk / Pula | Removed at the user's request |
| Stockhold | Stockholm |
| Galhopiggen | Galdhøpiggen |
| Mt. kebnekaise | Kebnekaise |
| Tubingen | Tübingen |
| Brusslles / Brusel | Brussels |
| Marseilles | Marseille |
| Záhřeb | Zagreb |
| Benátky | Venice |
| Kodaň | Copenhagen |
| Den Haague | The Hague |
| Antverpen | Antwerp |
| Norimberk | Nuremberg |
| Berlín | Berlin |
| Levkada | Lefkada |
| Kypr | Cyprus |
| Korith | Corinth, Greece |
| Berta, Albania | Berat, Albania |
| Kazbegi | Kazbegi / Stepantsminda, Georgia (town) |

Hawaii, islands and countries use representative area markers, not an inferred
visit to a particular city. Hawaii's marker represents the island group, around
Maui, and can be moved to an exact island or town by editing its coordinates.

City points and capital points come from GeoNames. Mountain points identify the
named peaks; areas and parks have representative points. Source links for the
city coordinates and checked mountain coordinates are retained in the catalogue.
These are travel overview pins, not navigation waypoints.
