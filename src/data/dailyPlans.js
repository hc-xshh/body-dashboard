import { analyzeBodySignals } from '../utils/rulesEngine.js'
import { getIntakeStrategyLabel } from '../utils/decisionPresentation.js'
import generatedTrainingPlans from './trainingPlans.generated.json'
import generatedDietPlan from './dietPlan.generated.json'
import generatedSkincarePlan from './skincarePlan.generated.json'

const WEEKDAY_ALIAS = {
  星期一: '周一',
  星期二: '周二',
  星期三: '周三',
  星期四: '周四',
  星期五: '周五',
  星期六: '周六',
  星期日: '周日',
}

export function getTodayLabel() {
  const weekday = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    weekday: 'long',
  }).format(new Date())

  return WEEKDAY_ALIAS[weekday] ?? weekday
}

export const weeklyTrainingLabel = {
  周一: '推力 + 上腹',
  周二: '下肢 + 下腹',
  周三: '主动恢复 + 有氧',
  周四: '拉力 + 腹斜肌',
  周五: '肩部专项 + 腹肌专项',
  周六: '固定有氧 + 主动恢复',
  周日: '主动恢复 + 可选有氧',
}

const trainingPlans = generatedTrainingPlans
const baseDietPlan = generatedDietPlan
const generatedSkincare = generatedSkincarePlan

function cloneItems(items) {
  return items.map(item => ({ ...item }))
}

function getModeAdjustments(primaryMode, trainingContext, signals) {
  const signalKeys = new Set(signals.map(signal => signal.key))
  const base = {
    snackDetail: null,
    snackNote: null,
    snackEmphasis: null,
    preWorkoutDetail: null,
    preWorkoutNote: null,
    postWorkoutDetail: null,
    postWorkoutNote: null,
    lunchDetail: null,
    lunchNote: null,
    lunchEmphasis: null,
    dinnerEmphasis: null,
    dinnerNote: null,
    strategyText: null,
    reminderTexts: [],
  }

  if (primaryMode === 'protect_metabolism') {
    base.strategyText = '今天优先保代谢：稳住午餐质量、训练前补给和训练后蛋白，不继续激进减餐。'
    base.lunchNote = '保护模式下，午餐必须是完整正餐，不能再省。'
    base.postWorkoutNote = '今天优先保住训练后蛋白，避免把短期体重波动误判成必须继续减量。'
    base.reminderTexts.push('保护模式下先删甜饮、酒精和夜间冗余摄入，不删正餐蛋白和主食。')
  } else if (primaryMode === 'tighten_intake') {
    base.strategyText = '今天优先收紧额外热量：先削下午加餐冗余、甜饮和晚间额外摄入，不动核心正餐蛋白。'
    base.snackDetail = trainingContext.recoveryDay ? 'WonderLab 双层脆心谷物棒 0-1根' : 'WonderLab 双层脆心谷物棒 1根'
    base.snackEmphasis = '今天加餐按最低有效量执行，先把冗余热量收回来。'
    base.dinnerNote = '晚餐后不再开第二轮零食，今天重点是截断多余摄入。'
    base.reminderTexts.push('先收额外热量，不要把“收紧摄入”理解成连正餐蛋白一起砍掉。')
  } else if (primaryMode === 'recovery_first') {
    base.strategyText = '今天以恢复优先：轻量补给、稳定正餐、避免把恢复日吃成奖励日。'
    base.snackDetail = 'WonderLab 双层脆心谷物棒 1根'
    base.snackNote = '恢复日默认按 1 根执行，避免补偿性进食。'
    base.preWorkoutDetail = '如果做有氧：香蕉 1根；如果只做恢复：可不额外补给'
    base.preWorkoutNote = '恢复日补给以轻量易消化为主。'
    base.postWorkoutDetail = '乳清蛋白粉 2-2.5 勺'
    base.postWorkoutNote = '即使今天训练轻，也保留蛋白补充，帮助恢复。'
    base.reminderTexts.push('恢复日减少的是额外零食，不是蛋白和正餐。')
  } else if (primaryMode === 'observe_noise') {
    base.strategyText = '今天先按稳定执行处理：更多是高噪声指标在波动，不根据单次异常做大动作。'
    base.reminderTexts.push('今天把重点放在固定时间测量、稳定作息和完整执行，不放大单次波动。')
  } else {
    base.strategyText = '今天按既定计划稳定执行，优先保证训练质量和饮食节律。'
  }

  if (signalKeys.has('fat_high')) {
    base.dinnerEmphasis = '体脂率偏高：晚餐保留蛋白和蔬菜，杂粮饭控在套餐标准量，不加甜饮和夜宵。'
    base.reminderTexts.push('今天减脂重点是删掉多余油脂、甜饮和夜宵，而不是极端少吃。')
  } else if (signalKeys.has('fat_mild_high')) {
    base.dinnerEmphasis = '体脂率轻度偏高：维持杂粮饭标准份量，不额外加炸物和高糖饮料。'
  }

  if (signalKeys.has('visceral_fat_high')) {
    base.lunchEmphasis = '内脏脂肪偏高：午餐优先鸡胸肉 + 蔬菜，避免高油酱汁和双份主食。'
    base.reminderTexts.push('内脏脂肪偏高时，先控晚间额外摄入，不再叠加零食和酒精。')
  }

  if (signalKeys.has('hydration_low') || signalKeys.has('hydration_declining')) {
    base.reminderTexts.push('全天饮水 2200ml 左右，训练日额外补 500ml，别把饮水都堆到晚上。')
  }

  if (signalKeys.has('recovery_rebound_likely')) {
    base.reminderTexts.push('体重小涨但体脂在回落时，更像恢复波动，不要误判成必须极端减量。')
  }

  return base
}

function isStrengthDay(weekday) {
  return ['周一', '周二', '周四', '周五'].includes(weekday)
}

function isCardioDay(weekday) {
  return ['周三', '周六', '周日'].includes(weekday)
}

function isLowerBodyDay(weekday) {
  return weekday === '周二'
}

function isRecoveryDay(weekday) {
  return ['周三', '周日'].includes(weekday)
}


export function getTrainingReadingReminders(weekday, badge) {
  if (badge === '恢复日') {
    return [
      '先看今天的恢复动作和时长，完成后再回头看趋势。',
      '恢复日目标是降疲劳，不是补训练量。',
      '今天更看重拉伸、呼吸和有氧是否完成。',
    ]
  }

  if (badge === '有氧日') {
    return [
      '先看今天做哪种有氧，再确认时长和强度。',
      '有氧日重点是完成时长，不靠额外加练刷存在感。',
      '做完再回看趋势，避免开始前被体重波动带跑。',
    ]
  }

  return [
    '先确认主训练动作、组数和休息，再开始练。',
    '力量日优先保证训练前补给和训练后蛋白。',
    '趋势只做复盘，不要在训练前临时改动作。',
  ]
}

export function getTrainingPlan(weekday) {
  return trainingPlans[weekday] ?? trainingPlans.周三
}

export function getDietPlan(latest, weekday, trainingLabel, history = []) {
  const items = cloneItems(baseDietPlan.items)
  const reminders = [...baseDietPlan.reminders]

  const strengthDay = isStrengthDay(weekday)
  const cardioDay = isCardioDay(weekday)
  const lowerBodyDay = isLowerBodyDay(weekday)
  const recoveryDay = isRecoveryDay(weekday)
  const trainingContext = { strengthDay, cardioDay, lowerBodyDay, recoveryDay }

  const rules = analyzeBodySignals(latest, history, trainingContext)
  const { primaryMode, evidence, confidence, badge: decisionBadge, summary, stageLabel, evidenceGroups, trainingLoadLabel, intakeStrategy } = rules.decision
  const strategySignals = []
  const trendSignals = []
  const bodyFocus = []

  const lunch = items.find(item => item.title === '午餐')
  const snack = items.find(item => item.title === '下午加餐')
  const preWorkout = items.find(item => item.title.includes('训练前'))
  const postWorkout = items.find(item => item.title === '补充' && item.time === '训练后')
  const dinner = items.find(item => item.title === '晚餐')

  if (!lunch || !snack || !preWorkout || !postWorkout || !dinner) {
    throw new Error('Generated diet plan missing required meal slots')
  }

  if (lowerBodyDay) {
    lunch.detail = '高蛋白轻食套餐：鸡胸肉 150-180g + 杂粮饭 120-150g + 蔬菜 200g'
    lunch.note = '下肢日训练量最大，午餐碳水比普通力量日再高一档。'
    snack.detail = 'WonderLab 双层脆心谷物棒 2根'
    snack.note = '下肢日不减下午加餐，避免晚上训练发空。'
    preWorkout.detail = '香蕉 1根 + 谷物棒 1根（训练前 45-60 分钟）'
    preWorkout.note = '今天是下肢训练日，训练前碳水要比上肢日更足。'
    postWorkout.detail = '乳清蛋白粉 2.5 勺'
    postWorkout.note = '下肢日训练后优先补蛋白，晚餐不要拖太晚。'
    reminders.push('下肢日不要一边做高训练量，一边又把主食压得太低。')
  } else if (strengthDay) {
    lunch.detail = '高蛋白轻食套餐：鸡胸肉 150g + 杂粮饭 100-120g + 蔬菜 200g'
    snack.detail = 'WonderLab 双层脆心谷物棒 2根'
    snack.note = '力量日加餐维持 2 根，不靠主观感觉减少。'
    preWorkout.detail = '香蕉 1根 + 如训练前偏饿可加 1 根谷物棒'
    preWorkout.note = '力量日优先保证训练前碳水，不要空腹硬练。'
    postWorkout.detail = '乳清蛋白粉 2.5 勺'
    postWorkout.note = `今天是 ${trainingLabel}，训练后优先保蛋白。`
    reminders.push('力量日谷物棒固定 2 根，除非你今天根本不训练。')
  } else if (cardioDay) {
    snack.detail = recoveryDay ? 'WonderLab 双层脆心谷物棒 1根' : 'WonderLab 双层脆心谷物棒 1-2根'
    snack.note = recoveryDay ? '恢复日控制为 1 根，避免把轻训练日吃成补偿日。' : '有氧日按饥饿程度在 1-2 根之间调整，但默认先从 1 根开始。'
    preWorkout.detail = recoveryDay ? '如果做有氧：香蕉 1根；如果只做恢复：可不额外补给' : '香蕉 1根（有氧前 20-40 分钟）'
    preWorkout.note = '今天不是重力量日，训练前补给以轻量易消化为主。'
    postWorkout.detail = '乳清蛋白粉 2-2.5 勺'
    postWorkout.note = '即使今天是恢复/有氧，也保留蛋白补充，避免代谢继续往下掉。'
    reminders.push(recoveryDay ? '恢复日不要把零食当奖励补回来。' : '有氧日减少的是额外零食，不是正餐蛋白。')
  }

  const adjustments = getModeAdjustments(primaryMode, trainingContext, rules.signals)

  if (adjustments.lunchDetail) lunch.detail = adjustments.lunchDetail
  if (adjustments.lunchNote) lunch.note = `${lunch.note ? `${lunch.note} ` : ''}${adjustments.lunchNote}`
  if (adjustments.lunchEmphasis) lunch.emphasis = `${lunch.emphasis ? `${lunch.emphasis} ` : ''}${adjustments.lunchEmphasis}`

  if (adjustments.snackDetail) snack.detail = adjustments.snackDetail
  if (adjustments.snackNote) snack.note = adjustments.snackNote
  if (adjustments.snackEmphasis) snack.emphasis = adjustments.snackEmphasis

  if (adjustments.preWorkoutDetail) preWorkout.detail = adjustments.preWorkoutDetail
  if (adjustments.preWorkoutNote) preWorkout.note = adjustments.preWorkoutNote

  if (adjustments.postWorkoutDetail) postWorkout.detail = adjustments.postWorkoutDetail
  if (adjustments.postWorkoutNote) postWorkout.note = adjustments.postWorkoutNote

  if (adjustments.dinnerEmphasis) dinner.emphasis = adjustments.dinnerEmphasis
  if (adjustments.dinnerNote) dinner.note = adjustments.dinnerNote

  reminders.push(...adjustments.reminderTexts)

  if (adjustments.strategyText) {
    strategySignals.push(adjustments.strategyText)
  }

  if (rules.signals.some(signal => signal.key === 'hydration_low') || rules.signals.some(signal => signal.key === 'hydration_declining')) {
    items.splice(Math.min(items.length, 6), 0, {
      time: '16:30',
      title: '补水检查点',
      detail: '补 400-500ml 水，避免把全天饮水都堆到晚上。',
      emphasis: '今天补水是硬任务，不是可选项。',
      note: '水分相关指标噪声较高，但连续偏低时仍应把补水执行到位。',
    })
  }

  rules.signals.forEach(signal => {
    if (signal.key === 'fat_high' || signal.key === 'fat_mild_high') bodyFocus.push(signal.evidence[0])
    if (signal.key === 'visceral_fat_high') bodyFocus.push(signal.evidence[0])
    if (signal.key === 'hydration_low' || signal.key === 'hydration_declining') bodyFocus.push('补水执行优先')
    if (signal.key === 'bmr_low') bodyFocus.push('基础代谢保护')
  })

  if (rules.signals.some(signal => signal.key === 'fat_rising_persistent')) {
    trendSignals.push(rules.signals.find(signal => signal.key === 'fat_rising_persistent')?.evidence?.[0])
  }
  if (rules.signals.some(signal => signal.key === 'fat_falling_persistent')) {
    trendSignals.push(rules.signals.find(signal => signal.key === 'fat_falling_persistent')?.evidence?.[0])
  }
  if (rules.signals.some(signal => signal.key === 'recovery_rebound_likely')) {
    trendSignals.push(rules.signals.find(signal => signal.key === 'recovery_rebound_likely')?.evidence?.join('；'))
  }
  if (rules.signals.some(signal => signal.key === 'false_cut_risk')) {
    trendSignals.push(rules.signals.find(signal => signal.key === 'false_cut_risk')?.evidence?.join('；'))
  }

  const longWindowSummary = [
    evidenceGroups?.baseline?.[0],
    evidenceGroups?.trend?.[0],
  ].filter(Boolean).join('；')

  const baselineBandSummary = [
    evidenceGroups?.baseline?.find(item => item.includes('波动带')),
    evidenceGroups?.baseline?.find(item => item.includes('相对个人基线')),
  ].filter(Boolean).join('；')

  const uniqueReminders = [...new Set(reminders.filter(Boolean))]
  const uniqueBodyFocus = [...new Set(bodyFocus.filter(Boolean))]
  const uniqueTrendSignals = [...new Set(trendSignals.filter(Boolean))]
  const intakeLabel = getIntakeStrategyLabel(intakeStrategy)
  const summaryHighlights = [
    uniqueBodyFocus.length ? `当前重点：${uniqueBodyFocus.slice(0, 2).join(' / ')}` : null,
    uniqueTrendSignals[0] ? `趋势：${uniqueTrendSignals[0]}` : null,
    longWindowSummary ? `基线：${longWindowSummary}` : null,
    baselineBandSummary ? `波动带：${baselineBandSummary}` : null,
  ].filter(Boolean).slice(0, 3)

  return {
    badge: decisionBadge,
    goal: baseDietPlan.goal,
    subtitle: '按当天训练和体测判断微调，直接顺着时间吃就行。',
    summary,
    metaLine: `${stageLabel} · ${trainingLoadLabel} · ${intakeLabel} · 置信度 ${(confidence * 100).toFixed(0)}%`,
    highlights: summaryHighlights,
    items,
    reminders: uniqueReminders,
    engine: rules.decision,
    sourceNote: baseDietPlan.sourceNote,
  }
}

export function getSkincarePlan(weekday) {
  return {
    morning: generatedSkincare.morning,
    evening: generatedSkincare.evening[weekday] ?? generatedSkincare.evening.周三,
    reminders: generatedSkincare.reminders,
    sourceNote: generatedSkincare.sourceNote,
  }
}
