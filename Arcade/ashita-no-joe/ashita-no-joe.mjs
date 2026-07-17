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
  description: 'Finish the game without using a continue.',
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
  id: 624039,
  title: 'Stand Tall against the Champion',
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
  id: 624040,
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

// Lutas de ringue vs de rua. Wolf (0x02) confirmado como rua: briga no backstage
// da arena contra ele e os capangas — não é luta sancionada.
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

// Score: 16-bit em 0x0384 (espelho 0x0388), armazenado como pontos/100, binário (não BCD).
// Zera no continue — 100.000 pontos exigem run de crédito único por natureza.
set.addAchievement({
  id: 624163,
  title: 'Become a Legend',
  description: 'Reach 100,000 points.',
  points: 10,
  conditions: $(
    ['', 'Mem',   '8bit',  0xfdae, '=', 'Value', '', 0x02],
    ['', 'Delta', '16bit', 0x0384, '<', 'Value', '', 1000],
    ['', 'Mem',   '16bit', 0x0384, '>=', 'Value', '', 1000],
  ),
})

// Degrau do Become a Legend (50.000 pts = valor 500). Recicla o slot da
// duplicata acidental 624164, atendendo ao pedido do CR por mais conquistas.
set.addAchievement({
  id: 624164,
  title: 'Rising Star',
  description: 'Reach 50,000 points.',
  points: 5,
  conditions: $(
    ['', 'Mem',   '8bit',  0xfdae, '=', 'Value', '', 0x02],
    ['', 'Delta', '16bit', 0x0384, '<', 'Value', '', 500],
    ['', 'Mem',   '16bit', 0x0384, '>=', 'Value', '', 500],
  ),
})

// Esquiva perfeita: vencer luta de ringue sem tomar dano algum.
// Mesmo esqueleto do Standing until the End, com reset em qualquer queda de HP.
set.addAchievement({
  id: 624167,
  title: 'Untouchable',
  description: 'Win a ring match without taking any damage.',
  points: 10,
  conditions: {
    core: $(
      inRealMatch,
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
    // começa quando o score sai de 0 numa partida real (cobre run nova e pós-continue)
    start: $(
      ['', 'Mem',   '8bit',  0xfdae, '=', 'Value', '', 0x02],
      ['', 'Delta', '16bit', 0x0384, '=', 'Value', '', 0],
      ['', 'Mem',   '16bit', 0x0384, '>', 'Value', '', 0],
    ),
    cancel: $(
      ['', 'Mem', '8bit', 0xfdae, '!=', 'Value', '', 0x02],
    ),
    // envia no ending (9 -> 0x0a) OU quando a tela de continue aparece (0x03e3 incrementa)
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

// Timer da luta (conta PARA CIMA): 0x0368 = segundos [BCD], 0x0369 = minutos.
// Vencer em menos de 60s = minutos ainda em 0 no frame da vitória.
set.addAchievement({
  id: 624165,
  title: 'Lightning Knockout',
  description: 'Win a ring match in under 60 seconds.',
  points: 10,
  conditions: {
    core: $(
      ['', 'Mem', '8bit', 0xfdae, '=', 'Value', '', 0x02],
      ['', 'Mem', '8bit', 0x0369, '=', 'Value', '', 0x00],
    ),
    ...Object.fromEntries(RING_STAGES.map((s, i) => [`alt${i + 1}`, $(
      ['AndNext', 'Delta', '8bit', 0x0304, '=', 'Value', '', s],
      ['Trigger', 'Mem',   '8bit', 0x0304, '=', 'Value', '', s + 1],
    )])),
  },
})

// Speedruns medidos em frames (Measured 1=1 acumula 1 hit/frame; o site formata como tempo)
set.addLeaderboard({
  id: 167461,
  title: 'Speedrun - Full Game',
  description: 'Fastest time to beat the game',
  type: 'FRAMES',
  lowerIsBetter: true,
  conditions: {
    start: $(
      ['', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
      ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0xff],
      ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x00],
    ),
    cancel: $(
      ['', 'Mem', '8bit', 0xfdae, '!=', 'Value', '', 0x02],
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
  description: 'Fastest time to defeat Jose Mendoza. Getting a game over cancels the attempt',
  type: 'FRAMES',
  lowerIsBetter: true,
  conditions: {
    start: $(
      ['', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
      ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', 0x08],
      ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', 0x09],
    ),
    // perder a luta (tela de continue aparece) ou sair do jogo cancela a tentativa
    cancel: $(
      ['OrNext', 'Mem', '8bit', 0xfdae, '!=', 'Value', '', 0x02],
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

// Registradores de golpe: 0x0346 = golpe normal ativo, 0x0347 = golpe Power ativo (01 = Power Uppercut).
// 0x0347 zera logo após o impacto — por isso aceitamos Mem OU Delta.
// HP do oponente: 0x0462 (espelho 0x0464), crava 0x00 no nocaute final.
set.addAchievement({
  id: 624166,
  title: "Tomorrow's Fight",
  description: 'Finish a match with a Power Uppercut.',
  points: 5,
  conditions: {
    core: $(
      ['',        'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
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

// Speedrun por estágio (Mendoza já tem o LB 167462). Mesmo padrão dos speedruns:
// start na entrada da luta, cancel em game over/saída, submit na vitória, valor em frames.
const FIGHT_NAMES = [
  'Toko Reformatory', 'Shohei Inagaki', 'Wolf Kanagushi', 'Toru Rikiishi', 'Gondo',
  'Tiger Ozaki', 'Carlos Rivera', 'Kin Ryuhi', 'Harimao',
]

FIGHT_NAMES.forEach((name, s) => {
  set.addLeaderboard({
    id: 167463 + s,
    title: `Speedrun - ${name}`,
    description: 'Fastest time to clear the stage. Getting a game over cancels the attempt',
    type: 'FRAMES',
    lowerIsBetter: true,
    conditions: {
      start: $(
        ['', 'Mem',   '8bit', 0xfdae, '=', 'Value', '', 0x02],
        ['', 'Delta', '8bit', 0x0304, '=', 'Value', '', s === 0 ? 0xff : s - 1],
        ['', 'Mem',   '8bit', 0x0304, '=', 'Value', '', s],
      ),
      cancel: $(
        ['OrNext', 'Mem', '8bit', 0xfdae, '!=', 'Value', '', 0x02],
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