# Puzzle review checklist

Wortense's rankings encode **intensity order**, which is a human judgement.
The automated tests in `src/data/puzzles.test.ts` and `src/data/data.test.ts`
prove the *structure* (word counts, ranks 1..N, single part of speech, length
caps, example contains the word, unique ids, rotation spacing, no word in more
than two puzzles) — **they cannot prove the ordering is pedagogically correct.**
A fluent English speaker must sign off on every ordering before launch.

## How to review

For each puzzle below, read the four/five words top-to-bottom and confirm they
run from mildest to most intense. Pay special attention to the puzzles carrying
a `reviewNote` (a dev-only field, never rendered) — those flag the closest
adjacent pairs.

## Puzzles with a reviewNote (closest calls)

| Puzzle id | Theme | Note |
| --- | --- | --- |
| anger-01 | Anger | furious vs enraged — enraged implies loss of control |
| size-big-01 | Bigness | enormous vs gigantic — gigantic ≈ unimaginable |
| worry-01 | Worry | concerned vs worried — concerned is milder |
| brightness-01 | Brightness | brilliant vs dazzling — dazzling overwhelms the eyes |
| fear-01 | Fear | nervous vs scared — nervous leans to mild anxiety |
| wind-01 | Wind | gust is a burst, not sustained |
| sadness-01 | Sadness | glum vs sad — glum stresses a quiet low |
| good-quality-01 | Good quality | excellent/outstanding/superb are very close |
| hunger-01 | Hunger | famished/ravenous/starving very close |
| surprise-01 | Surprise | astonished vs astounded — astounded stuns |
| desire-01 | Desire | crave vs yearn — yearn is longer, more emotional |
| disliking-01 | Disliking | detest vs loathe — loathe adds disgust |
| smallness-01 | Smallness | minute vs minuscule |
| hotness-01 | Hotness | boiling vs scorching |
| strength-01 | Strength | powerful vs mighty |
| walking-01 | Walking | stride vs march |
| wetness-01 | Wetness | soaked vs drenched |
| certainty-01 | Certainty | certain vs definite |
| loudness-01 | Loudness | blaring vs deafening |
| dirtiness-01 | Dirtiness | dirty vs grimy |
| cleanliness-01 | Cleanliness | spotless vs pristine |
| enthusiasm-01 | Enthusiasm | eager vs enthusiastic |
| hitting-01 | Hitting | strike vs pound |
| bravery-01 | Bravery | fearless vs heroic |
| tastiness-01 | Tastiness | scrumptious vs delectable |
| bad-smell-01 | Bad smell | stinking vs putrid |
| breaking-01 | Breaking | shatter vs pulverize |
| crying-01 | Crying | sob vs wail |
| difficulty-01 | Difficulty | difficult/tough/demanding close |
| confusion-01 | Confusion | baffled vs bewildered |
| throwing-01 | Throwing | fling vs hurl |
| sleep-01 | Sleep | doze vs nap |
| funniness-01 | Funniness | hilarious vs uproarious |
| pulling-01 | Pulling | yank vs wrench |
| calmness-01 | Calmness | serene vs tranquil |
| dullness-01 | Dullness | tedious vs tiresome |
| asking-01 | Asking | beg vs implore |
| laughing-01 | Laughing | chuckle vs giggle ordering |
| friendliness-01 | Friendliness | welcoming vs hospitable |
| cutting-01 | Cutting | slash vs hack |
| destroying-01 | Destroying | devastate vs annihilate |
| speed-01 | Speed | swift vs rapid |
| fire-01 | Fire | inferno vs conflagration |
| problem-01 | Problem | crisis vs catastrophe |
| importance-01 | Importance | crucial vs vital |
| strangeness-01 | Strangeness | weird vs bizarre |
| shining-01 | Shining | glimmer vs glow |
| ugliness-01 | Ugliness | grotesque vs monstrous |

## Sign-off

- [ ] All 44 daily orderings reviewed by a fluent English speaker.
- [ ] All 16 practice orderings reviewed.
- [ ] Any disputed ordering corrected in the batch JSON and re-tested with `npm test`.