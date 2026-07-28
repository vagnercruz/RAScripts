import { AchievementSet, RichPresence, define as $ } from '@cruncheevos/core'

const set = new AchievementSet({
  gameId: 13598,
  title: 'Legend of Success Joe | Ashita no Joe Densetsu',
})

const inRealMatch = ['', 'Mem', '8bit', 0xfdae, '=', 'Value', '', 0x02]

// Single player lock. BIOS_PLAYER_MOD2 lives at 0xfdb6 (0 = out, 1 = playing).
// HEADS UP: 68K work RAM is exposed byte-swapped within each 16-bit word, so the
// NeoGeo dev wiki address ($10FDB7) reads at 0xfdb6 here - 0xfdb7 is P1's status
// and sits at 1 during any normal session, making it useless as a guard.
// With P2 in the session the game gives alternating turns, which would be a free
// retry at every challenge, so the whole set requires a single player session.
const noPlayer2 = ['', 'Mem', '8bit', 0xfdb6, '=', 'Value', '', 0x00]
const resetIfPlayer2 = ['ResetIf', 'Mem', '8bit', 0xfdb6, '!=', 'Value', '', 0x00]

const stageClearConditions = from => [
  inRealMatch,
  noPlayer2,
  ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', from],
  ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', from + 1],
]

const stageClear = from => $(...stageClearConditions(from))

// IDs of the achievements already published as Unofficial on the server
const progression = [
  [623786, 'Boss of the Juvenile Hall', 'Complete the Toko Juvenile Hall stage.'],
  [623787, 'License to Knock Out', 'Defeat Inagaki and earn your professional boxing license.'],
  [623788, 'Wolf Hunter', 'Defeat Wolf Kanagushi.'],
  [623789, 'The Punch That Lasts Forever', 'Defeat Rikiishi.'],
  [623790, 'Fists of Despair', 'Defeat the bully Gondo.'],
  [623791, "Joe's Return", 'Defeat Tiger Osaki.'],
  [623792, 'The Hero from Venezuela', 'Defeat Carlos Rivera.'],
  [623793, 'Overheating the Cold Computer', 'Defeat Ryuhi Kin.'],
  [623794, 'The Wildest from Malaysia', 'Defeat Harimao.'],
]

progression.forEach(([id, title, description], i) => {
  set.addAchievement({
    id,
    title,
    description,
    points: 5,
    type: 'progression',
    conditions: stageClear(i),
  })
})

// Stage ID: 0x09 = Jose Mendoza, 0x0a = ending (0xfdae stays 0x02 through it)
set.addAchievement({
  id: 623796,
  title: 'Tomorrow Belongs to Joe',
  description: 'Defeat Jose Mendoza and become the World Bantamweight Champion.',
  points: 25,
  type: 'win_condition',
  conditions: stageClear(0x09),
})

// 0x03e3 counts continue screens; resets on game over and on machine reset
set.addAchievement({
  id: 623797,
  title: 'Completely White Ashes',
  description: 'Finish the game without using a continue.',
  points: 25,
  // 0xfdb6 returns to 0 once P2 is done, so "P2 == 0 at the win" is not enough:
  // a flag armed at run start (title -> stage 0) is killed if P2 ever joins,
  // which proves the whole run was single player.
  conditions: $(
    inRealMatch,
    noPlayer2,
    ['',        'Mem',   '8bit', 0x03e3, '=', 'Value', '', 0],
    ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0xff],
    ['',        'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x00, 1],
    resetIfPlayer2,
    ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x09],
    ['Trigger', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x0a],
  ),
})

// Total energy (0x0362, mirror 0x0364): 0x78 full, bars are NOT equal thirds.
// A knockdown is HP crossing a bar boundary (0x48, 0x20, 0x00) in a single frame.

// "Without being knocked down": flag armed on entering the fight (1 hit), any
// knockdown resets it, and the win only triggers if the flag survived.
set.addAchievement({
  id: 624039,
  title: 'Stand Tall against the Champion',
  description: 'Defeat Jose Mendoza without being knocked down.',
  points: 25,
  conditions: $(
    ['AndNext', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
    ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x08],
    ['',        'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x09, 1],
    resetIfPlayer2,
    ['AndNext', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x09],
    ['AndNext', 'Delta', '8bit', 0x0362, '>', 'Value', '', 0x48],
    ['ResetIf', 'Mem',   '8bit', 0x0362, '<=', 'Value', '', 0x48],
    ['AndNext', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x09],
    ['AndNext', 'Delta', '8bit', 0x0362, '>', 'Value', '', 0x20],
    ['ResetIf', 'Mem',   '8bit', 0x0362, '<=', 'Value', '', 0x20],
    ['AndNext', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x09],
    ['AndNext', 'Delta', '8bit', 0x0362, '>', 'Value', '', 0x00],
    ['ResetIf', 'Mem',   '8bit', 0x0362, '=', 'Value', '', 0x00],
    ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x09],
    ['Trigger', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x0a],
  ),
})

// "At most 1 knockdown": knockdowns tally into a pool (AddHits) and the second
// one resets the flag. PauseIf freezes the group outside the Rikiishi fight so
// knockdowns from earlier stages never count.
set.addAchievement({
  id: 624040,
  title: 'Master of the Sway',
  description: 'Defeat Rikiishi while suffering no more than one knockdown.',
  points: 10,
  conditions: $(
    ['AndNext', 'Mem',   '8bit', 0x0304, '!=', 'Value', '', 0x03],
    ['PauseIf', 'Mem',   '8bit', 0x0304, '!=', 'Value', '', 0x04],
    ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x02],
    ['',        'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x03, 1],
    resetIfPlayer2,
    ['AndNext', 'Delta', '8bit', 0x0362, '>', 'Value', '', 0x48],
    ['AddHits', 'Mem',   '8bit', 0x0362, '<=', 'Value', '', 0x48],
    ['AndNext', 'Delta', '8bit', 0x0362, '>', 'Value', '', 0x20],
    ['AddHits', 'Mem',   '8bit', 0x0362, '<=', 'Value', '', 0x20],
    ['AndNext', 'Delta', '8bit', 0x0362, '>', 'Value', '', 0x00],
    ['AddHits', 'Mem',   '8bit', 0x0362, '=', 'Value', '', 0x00],
    ['ResetIf', 'Value', '', 0, '=', 'Value', '', 1, 2],
    ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x03],
    ['Trigger', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x04],
  ),
})

// Ring matches vs street fights. Wolf (0x02) confirmed as street: a backstage
// brawl against him and his bodyguards, not a sanctioned bout.
const RING_STAGES = [0x01, 0x03, 0x05, 0x07, 0x09]
const STREET_STAGES = [0x00, 0x02, 0x04, 0x06, 0x08]

// Shared core: real match, and any knockdown (boundary crossing) resets it.
// The 0x0304 <= 9 gate keeps ending-screen memory clears from firing a reset.
const knockdownResetCore = $(
  ['', 'Mem', '8bit', 0xfdae, '=', 'Value', '', 0x02],
  resetIfPlayer2,
  ['AndNext', 'Mem',   '8bit', 0x0304, '<=', 'Value', '', 0x09],
  ['AndNext', 'Delta', '8bit', 0x0362, '>', 'Value', '', 0x48],
  ['ResetIf', 'Mem',   '8bit', 0x0362, '<=', 'Value', '', 0x48],
  ['AndNext', 'Mem',   '8bit', 0x0304, '<=', 'Value', '', 0x09],
  ['AndNext', 'Delta', '8bit', 0x0362, '>', 'Value', '', 0x20],
  ['ResetIf', 'Mem',   '8bit', 0x0362, '<=', 'Value', '', 0x20],
  ['AndNext', 'Mem',   '8bit', 0x0304, '<=', 'Value', '', 0x09],
  ['AndNext', 'Delta', '8bit', 0x0362, '>', 'Value', '', 0x00],
  ['ResetIf', 'Mem',   '8bit', 0x0362, '=', 'Value', '', 0x00],
)

// One alt per fight: armed on entering it (coming from the previous stage; stage
// 0 comes from the title, 0xff) and triggered by the win, if the flag lived.
const flawlessFight = stage => $(
  ['AndNext', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
  ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', stage === 0 ? 0xff : stage - 1],
  ['',        'Mem',   '8bit', 0x0304, '=', 'Value', '', stage, 1],
  ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', stage],
  ['Trigger', 'Mem',   '8bit', 0x0304, '=', 'Value', '', stage + 1],
)

const altsFor = stages =>
  Object.fromEntries(stages.map((s, i) => [`alt${i + 1}`, flawlessFight(s)]))

set.addAchievement({
  id: 624041,
  title: 'Standing until the End',
  description: 'Win a ring match without being knocked down.',
  points: 5,
  conditions: { core: knockdownResetCore, ...altsFor(RING_STAGES) },
})

set.addAchievement({
  id: 624042,
  title: 'King of the Streets',
  description: 'Complete a street fight stage without being knocked down.',
  points: 5,
  conditions: { core: knockdownResetCore, ...altsFor(STREET_STAGES) },
})

// Score: 16-bit at 0x0384 (mirror 0x0388), stored as points/100, plain binary
// (not BCD). Resets on continue, so 100,000 points is inherently a 1-credit run.
set.addAchievement({
  id: 624163,
  title: 'Become a Legend',
  description: 'Reach 100,000 points.',
  points: 10,
  conditions: $(
    ['', 'Mem',   '8bit',  0xfdae, '=', 'Value', '', 0x02],
    noPlayer2,
    ['', 'Delta', '16bit', 0x0384, '<', 'Value', '', 1000],
    ['', 'Mem',   '16bit', 0x0384, '>=', 'Value', '', 1000],
  ),
})

// Stepping stone to Become a Legend (50,000 pts = value 500). Reuses the slot of
// an accidental duplicate (624164); added on the reviewers request for more
// achievements.
set.addAchievement({
  id: 624164,
  title: 'Rising Star',
  description: 'Reach 50,000 points.',
  points: 5,
  conditions: $(
    ['', 'Mem',   '8bit',  0xfdae, '=', 'Value', '', 0x02],
    noPlayer2,
    ['', 'Delta', '16bit', 0x0384, '<', 'Value', '', 500],
    ['', 'Mem',   '16bit', 0x0384, '>=', 'Value', '', 500],
  ),
})

// Perfect defense: win a ring match without taking a single hit. Same skeleton
// as Standing until the End, but any HP drop resets it.
set.addAchievement({
  id: 624167,
  title: 'Untouchable',
  description: 'Win a ring match without taking any damage.',
  points: 10,
  conditions: {
    core: $(
      inRealMatch,
      resetIfPlayer2,
      ['AndNext', 'Mem', '8bit', 0x0304, '<=', 'Value', '', 0x09],
      ['ResetIf', 'Mem', '8bit', 0x0362, '<', 'Delta', '8bit', 0x0362],
    ),
    ...altsFor(RING_STAGES),
  },
})

set.addLeaderboard({
  id: 167454,
  title: 'Score Attack - 1 Credit',
  description: 'Highest score on a single credit. Submits on game over or after defeating Jose Mendoza',
  type: 'SCORE',
  lowerIsBetter: false,
  conditions: {
    // starts when the score leaves 0 in a real match (new runs and post-continue)
    start: $(
      ['', 'Mem',   '8bit',  0xfdae, '=', 'Value', '', 0x02],
      noPlayer2,
      ['', 'Delta', '16bit', 0x0384, '=', 'Value', '', 0],
      ['', 'Mem',   '16bit', 0x0384, '>', 'Value', '', 0],
    ),
    cancel: $(
      ['OrNext', 'Mem', '8bit', 0xfdae, '!=', 'Value', '', 0x02],
      ['',       'Mem', '8bit', 0xfdb6, '!=', 'Value', '', 0x00],
    ),
    // submits at the ending (9 -> 0x0a) OR when the continue screen shows (0x03e3 ticks)
    submit: $(
      ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x09],
      ['OrNext',  'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x0a],
      ['',        'Mem',   '8bit', 0x03e3, '>', 'Delta', '8bit', 0x03e3],
    ),
    value: $(
      ['Measured', 'Mem', '16bit', 0x0384, '*', 'Value', '', 100],
    ),
  },
})

// Match timer counts UP: 0x0368 = seconds [BCD], 0x0369 = minutes.
// Winning under 60 seconds means minutes are still 0 at the winning frame.
set.addAchievement({
  id: 624165,
  title: 'Lightning Knockout',
  description: 'Win a ring match in under 60 seconds.',
  points: 10,
  // Anchored on the KO (opponent HP crossing to 0) instead of the stage change:
  // it measures the fight itself, free of the victory animation, and it never
  // lights the challenge indicator outside the ring (no Trigger flag to prime).
  conditions: {
    core: $(
      ['', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
      noPlayer2,
      ['', 'Mem',   '8bit', 0x0369, '=', 'Value', '', 0x00],
      ['', 'Delta', '8bit', 0x0462, '>', 'Value', '', 0x00],
      ['', 'Mem',   '8bit', 0x0462, '=', 'Value', '', 0x00],
    ),
    ...Object.fromEntries(RING_STAGES.map((s, i) => [`alt${i + 1}`, $(
      ['', 'Mem', '8bit', 0x0304, '=', 'Value', '', s],
    )])),
  },
})

// Speedruns measured in frames (Measured 1=1 tallies one hit per frame; the site
// formats the value as a time)
set.addLeaderboard({
  id: 167461,
  title: 'Speedrun - Full Game',
  description: 'Fastest time to beat the game. The timer runs from the first stage until the ending starts',
  type: 'FRAMES',
  lowerIsBetter: true,
  conditions: {
    start: $(
      ['', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
      noPlayer2,
      ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0xff],
      ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x00],
    ),
    cancel: $(
      ['OrNext', 'Mem', '8bit', 0xfdae, '!=', 'Value', '', 0x02],
      ['',       'Mem', '8bit', 0xfdb6, '!=', 'Value', '', 0x00],
    ),
    submit: $(
      ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x09],
      ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x0a],
    ),
    value: $(
      ['Measured', 'Value', '', 1, '=', 'Value', '', 1],
    ),
  },
})

set.addLeaderboard({
  id: 167462,
  title: 'Speedrun - Jose Mendoza',
  description: 'Fastest clear of the final fight. The timer runs from the moment the stage loads until the ending starts, so the intro and victory scenes are included. Getting a game over cancels the attempt',
  type: 'FRAMES',
  lowerIsBetter: true,
  conditions: {
    start: $(
      ['', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
      noPlayer2,
      ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x08],
      ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x09],
    ),
    // losing the fight (continue screen), P2 joining, or leaving the game cancels it
    cancel: $(
      ['OrNext', 'Mem', '8bit', 0xfdae, '!=', 'Value', '', 0x02],
      ['OrNext', 'Mem', '8bit', 0xfdb6, '!=', 'Value', '', 0x00],
      ['',       'Mem', '8bit', 0x03e3, '>', 'Delta', '8bit', 0x03e3],
    ),
    submit: $(
      ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x09],
      ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x0a],
    ),
    value: $(
      ['Measured', 'Value', '', 1, '=', 'Value', '', 1],
    ),
  },
})

// Move registers: 0x0346 = active normal punch, 0x0347 = active Power punch
// (0x01 = Power Uppercut). 0x0347 clears right after impact, hence Mem OR Delta.
// Opponent HP: 0x0462 (mirror 0x0464), snaps to 0x00 on the final KO.
set.addAchievement({
  id: 624166,
  title: "Tomorrow's Fight",
  description: 'Finish a match with a Power Uppercut.',
  points: 5,
  conditions: {
    core: $(
      ['',        'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
      noPlayer2,
      ['',        'Delta', '8bit', 0x0462, '>', 'Value', '', 0x00],
      ['',        'Mem',   '8bit', 0x0462, '=', 'Value', '', 0x00],
      ['OrNext',  'Mem',   '8bit', 0x0347, '=', 'Value', '', 0x01],
      ['',        'Delta', '8bit', 0x0347, '=', 'Value', '', 0x01],
    ),
    ...Object.fromEntries(RING_STAGES.map((s, i) => [`alt${i + 1}`, $(
      ['', 'Mem', '8bit', 0x0304, '=', 'Value', '', s],
    )])),
  },
})

// Per-stage speedruns (Mendoza already has board 167462). Same pattern as the
// other speedruns: start on entering the fight, cancel on game over or leaving,
// submit on the win, value in frames.
const FIGHT_NAMES = [
  'Toko Reformatory', 'Shohei Inagaki', 'Wolf Kanagushi', 'Toru Rikiishi', 'Gondo',
  'Tiger Ozaki', 'Carlos Rivera', 'Kin Ryuhi', 'Harimao',
]

FIGHT_NAMES.forEach((name, s) => {
  set.addLeaderboard({
    id: 167463 + s,
    title: `Speedrun - ${name}`,
    description: 'Fastest stage clear. The timer runs from the moment the stage loads until the next one starts, so the intro and victory scenes are included. Getting a game over cancels the attempt',
    type: 'FRAMES',
    lowerIsBetter: true,
    conditions: {
      start: $(
        ['', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
        noPlayer2,
        ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', s === 0 ? 0xff : s - 1],
        ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', s],
      ),
      cancel: $(
        ['OrNext', 'Mem', '8bit', 0xfdae, '!=', 'Value', '', 0x02],
        ['OrNext', 'Mem', '8bit', 0xfdb6, '!=', 'Value', '', 0x00],
        ['',       'Mem', '8bit', 0x03e3, '>', 'Delta', '8bit', 0x03e3],
      ),
      submit: $(
        ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', s],
        ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', s + 1],
      ),
      value: $(
        ['Measured', 'Value', '', 1, '=', 'Value', '', 1],
      ),
    },
  })
})

export const rich = RichPresence({
  lookupDefaultParameters: { keyFormat: 'hex' },
  lookup: {
    Fight: {
      values: {
        0x0: 'for the top spot at the Toko Reformatory',
        0x1: 'Shohei Inagaki for the pro boxing license',
        0x2: 'Wolf Kanagushi',
        0x3: 'his rival, Toru Rikiishi',
        0x4: 'Gondo in the streets',
        0x5: 'Tiger Ozaki',
        0x6: 'Carlos Rivera outside the ring',
        0x7: 'Kin Ryuhi, the Cold Computer',
        0x8: 'Harimao at the airport',
        0x9: 'Jose Mendoza for the World Bantamweight title',
        '*': 'his way to the top',
      },
      defaultAt: $.one(['Measured', 'Mem', '8bit', 0x0304]),
    },
  },
  displays: ({ lookup, tag }) => [
    [$(['', 'Mem', '8bit', 0xfdae, '!=', 'Value', '', 0x02]), 'At the title screen'],
    [
      $(['', 'Mem', '8bit', 0x0304, '=', 'Value', '', 0x0a]),
      'Tomorrow has come: Joe Yabuki is the World Bantamweight Champion',
    ],
    [
      $(['', 'Mem', '8bit', 0xfdae, '=', 'Value', '', 0x02]),
      tag`Joe is fighting ${lookup.Fight}`,
    ],
    'Joe Yabuki, on the road to tomorrow',
  ],
})

export default set