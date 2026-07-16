import { AchievementSet, RichPresence, define as $ } from '@cruncheevos/core'

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
  id: 623796,
  title: 'Tomorrow Belongs to Joe',
  description: 'Defeat Jose Mendoza and become the World Bantamweight Champion.',
  points: 25,
  type: 'win_condition',
  conditions: stageClear(0x09),
})

// 0x03e3 conta aparições da tela de continue; zera em game over/reset
set.addAchievement({
  id: 623797,
  title: 'Completely White Ashes',
  description: 'Finish the game without using a continue (1CC).',
  points: 25,
  conditions: $(
    ...stageClearConditions(0x09),
    ['', 'Mem', '8bit', 0x03e3, '=', 'Value', '', 0],
  ),
})

// Energia total (0x0362, espelho 0x0364): 0x78 = 3 barras de 0x28.
// Queda = HP cruzando uma fronteira de barra (0x50, 0x28, 0x00) num único frame.

// "Sem ser derrubado": arma flag ao entrar na luta (hit 1); qualquer queda reseta; vitória dispara.
set.addAchievement({
  title: 'Stand Tall Against the Champion',
  description: 'Defeat Jose Mendoza without being knocked down.',
  points: 25,
  conditions: $(
    ['AndNext', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
    ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x08],
    ['',        'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x09, 1],
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

// "No máximo 1 queda": quedas acumulam num pool (AddHits); a 2ª reseta a flag.
// PauseIf congela o grupo fora da luta do Rikiishi para quedas anteriores não contarem.
set.addAchievement({
  title: 'Master of the Sway',
  description: 'Defeat Rikiishi while suffering no more than one knockdown.',
  points: 10,
  conditions: $(
    ['AndNext', 'Mem',   '8bit', 0x0304, '!=', 'Value', '', 0x03],
    ['PauseIf', 'Mem',   '8bit', 0x0304, '!=', 'Value', '', 0x04],
    ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x02],
    ['',        'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x03, 1],
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

// Lutas de ringue vs de rua (0x02 Wolf classificado como rua — CONFIRMAR visualmente)
const RING_STAGES = [0x01, 0x03, 0x05, 0x07, 0x09]
const STREET_STAGES = [0x00, 0x02, 0x04, 0x06, 0x08]

// Core compartilhado: em jogo real + qualquer queda (cruzamento de fronteira) reseta.
// Gate 0x0304 <= 9 impede reset por limpeza de memória nas telas de ending.
const knockdownResetCore = $(
  ['', 'Mem', '8bit', 0xfdae, '=', 'Value', '', 0x02],
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

// Alt por luta: arma ao entrar (vindo do estágio anterior; estágio 0 vem do título 0xff)
// e dispara na vitória — se a flag sobreviveu às quedas.
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
  title: 'Standing Until the End',
  description: 'Win a ring match without being knocked down.',
  points: 5,
  conditions: { core: knockdownResetCore, ...altsFor(RING_STAGES) },
})

set.addAchievement({
  title: 'King of the Streets',
  description: 'Complete a street fight stage without being knocked down.',
  points: 5,
  conditions: { core: knockdownResetCore, ...altsFor(STREET_STAGES) },
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
    tag`Joe is fighting ${lookup.Fight}`,
  ],
})

export default set