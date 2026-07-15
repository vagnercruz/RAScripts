import { AchievementSet, define as $ } from '@cruncheevos/core'

const set = new AchievementSet({
  gameId: 13598,
  title: 'Legend of Success Joe | Ashita no Joe Densetsu',
})

const inRealMatch = ['', 'Mem', '8bit', 0xfdae, '=', 'Value', '', 0x02]

const stageClearConditions = from => [
  inRealMatch,
  ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', from],
  ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', from + 1],
]

const stageClear = from => $(...stageClearConditions(from))

// IDs = conquistas publicadas em Unofficial no servidor
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

// Stage ID: 0x09 = Jose Mendoza, 0x0a = ending (0xfdae segue 0x02 durante o ending)
set.addAchievement({
  title: 'Tomorrow Belongs to Joe',
  description: 'Defeat Jose Mendoza and become the World Bantamweight Champion.',
  points: 25,
  type: 'win_condition',
  conditions: stageClear(0x09),
})

// 0x03e3 conta aparições da tela de continue; zera em game over/reset
set.addAchievement({
  title: 'Completely White Ashes',
  description: 'Finish the game without using a continue (1CC).',
  points: 25,
  conditions: $(
    ...stageClearConditions(0x09),
    ['', 'Mem', '8bit', 0x03e3, '=', 'Value', '', 0],
  ),
})

export default set