import { AchievementSet, define as $ } from '@cruncheevos/core'

const set = new AchievementSet({
  gameId: 13598,
  title: 'Legend of Success Joe | Ashita no Joe Densetsu',
})

const inRealMatch = ['', 'Mem', '8bit', 0xfdae, '=', 'Value', '', 0x02]

const stageClear = from => $(
  inRealMatch,
  ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', from],
  ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', from + 1],
)

const progression = [
  ['Boss of the Juvenile Hall', 'Complete the Toko Juvenile Hall stage.'],
  ['License to Knock Out', 'Defeat Inagaki and earn your professional boxing license.'],
  ['Wolf Hunter', 'Defeat Wolf Kanagushi.'],
  ['The Punch That Lasts Forever', 'Defeat Rikiishi.'],
  ['Fists of Despair', 'Defeat the bully Gondo.'],
  ["Joe's Return", 'Defeat Tiger Osaki.'],
  ['The Hero from Venezuela', 'Defeat Carlos Rivera.'],
  ['Overheating the Cold Computer', 'Defeat Ryuhi Kin.'],
  ['The Wildest from Malaysia', 'Defeat Harimao.'],
]

progression.forEach(([title, description], i) => {
  set.addAchievement({
    title,
    description,
    points: 5,
    type: 'progression',
    conditions: stageClear(i),
  })
})

export default set