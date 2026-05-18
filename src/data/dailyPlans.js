import { analyzeBodySignals } from '../utils/rulesEngine'

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

const trainingPlans = {
  周一: {
    badge: '力量日',
    title: '推力 + 上腹',
    subtitle: '胸 / 肩 / 三头 + 上腹直肌',
    items: [
      { title: '热身', time: '5-8 分钟', steps: ['肩部环绕 前后各10次', '手臂画圈 前后各10次', '弹力带肩外旋 2×15', '墙壁俯卧撑 2×10', '手腕环绕 各方向10次'] },
      { title: '主训练', time: '约 25-35 分钟', rest: '60-90 秒', steps: ['俯卧撑（手放哑铃上）3×10-15', '哑铃推举（坐姿）3×12', '哑铃侧平举 3×15', '钻石俯卧撑 3×8-12', '俯身哑铃划船 3×12/臂'] },
      { title: '腹肌', time: '训练后', rest: '45-60 秒', steps: ['哑铃卷腹 3×15'] },
      { title: '拉伸', time: '5-10 分钟', steps: ['门框胸肌拉伸', '过头三头拉伸', '交叉肩后束拉伸', '婴儿式'] },
    ],
  },
  周二: {
    badge: '力量日',
    title: '下肢 + 下腹',
    subtitle: '腿 / 臀 + 下腹直肌',
    items: [
      { title: '热身', time: '5-8 分钟', steps: ['原地高抬腿 30秒', '髋关节环绕 每侧10次', '徒手深蹲 2×10', '弓步转体 每侧8次', '臀桥 2×10', '单腿平衡 每侧20秒'] },
      { title: '主训练', time: '约 30-40 分钟', rest: '75-90 秒', steps: ['高脚杯深蹲（壶铃）4×12', '保加利亚分腿蹲 3×10/腿', '箭步蹲（手持哑铃）3×8/腿', '罗马尼亚硬拉（哑铃）3×12', '壶铃摆荡 3×15-20', '平板支撑 3×45秒', '死虫式 3×10/侧'] },
      { title: '腹肌', time: '训练后', rest: '45-60 秒', steps: ['反向卷腹 3×12'] },
      { title: '拉伸', time: '5-10 分钟', steps: ['坐姿前屈', '鸽子式', '股四头肌拉伸', '青蛙趴'] },
    ],
  },
  周三: {
    badge: '恢复日',
    title: '主动恢复 + 有氧',
    subtitle: '放松肌肉、促进恢复、继续压内脏脂肪',
    items: [
      { title: '有氧运动', time: '30 分钟', steps: ['快走/慢跑（优先）', '骑车（次选）', '天气不好时可改居家 HIIT 15-20 分钟'] },
      { title: '泡沫轴放松', time: '6 分钟', steps: ['大腿前侧 1分钟', '大腿外侧 1分钟', '臀部 1分钟', '背部（上+下）1分钟'] },
      { title: '静态拉伸', time: '10 分钟', steps: ['猫牛式 10次', '下犬式 60秒', '鸽子式 每侧60秒', '仰卧抱膝 60秒', '颈部拉伸 各方向30秒'] },
      { title: '呼吸放松', time: '3 分钟', steps: ['腹式呼吸 3分钟'] },
    ],
  },
  周四: {
    badge: '力量日',
    title: '拉力 + 腹斜肌',
    subtitle: '背 / 二头 + 腹斜肌',
    items: [
      { title: '热身', time: '5-8 分钟', steps: ['肩部环绕 前后各10次', '弹力带肩外旋 2×15', '肩胛骨收缩（空手）2×15', '死虫式 1×10'] },
      { title: '主训练', time: '约 25-35 分钟', rest: '60-90 秒', steps: ['俯身宽握哑铃划船 4×12', '单臂哑铃划船 3×12/臂', '双手哑铃俯身划船 3×15', '哑铃弯举 3×15', '锤式弯举 3×12'] },
      { title: '腹肌', time: '训练后', rest: '45-60 秒', steps: ['俄罗斯转体（持哑铃）3×20'] },
      { title: '拉伸', time: '5-10 分钟', steps: ['婴儿式', '二头肌拉伸（靠墙）', '抱膝滚动', '颈部侧屈拉伸'] },
    ],
  },
  周五: {
    badge: '力量日',
    title: '肩部专项 + 腹肌专项',
    subtitle: '肩部强化 + 腹肌全面刺激',
    items: [
      { title: '热身', time: '5-8 分钟', steps: ['肩部环绕 前后各15次', '手臂画圈 前后各10次', '弹力带肩外旋 2×15', '俯身Y字上举 2×15', '俯身W字收缩 2×15', '墙壁俯卧撑 2×10', '死虫式 1×10'] },
      { title: '主训练', time: '约 20-30 分钟', rest: '60-75 秒', steps: ['阿诺德推举 3×12', '哑铃前平举 3×12', '俯身哑铃飞鸟 3×15'] },
      { title: '腹肌专项', time: '15 分钟', rest: '45-60 秒', steps: ['卷腹 3×15', '反向卷腹 3×15', '俄罗斯转体 3×20', '侧平板支撑 3×30秒/侧', '平板支撑 2×60秒'] },
      { title: '拉伸', time: '5-10 分钟', steps: ['交叉肩后束拉伸', '过头三头拉伸', '颈部拉伸', '婴儿式'] },
    ],
  },
  周六: {
    badge: '有氧日',
    title: '固定有氧 + 主动恢复',
    subtitle: '提升心肺、增加热量消耗、不叠加过多疲劳',
    items: [
      { title: '热身', time: '5-8 分钟', steps: ['原地慢跑/快走 2分钟', '开合跳 30秒', '髋关节环绕 每侧10次', '动态弓步 每侧8次', '肩部环绕 前后各10次'] },
      { title: '有氧运动', time: '30 分钟', steps: ['快走/慢跑（首选）', '骑车（次选）', '天气不好时可改居家 HIIT 15-20 分钟'] },
      { title: '泡沫轴放松', time: '6 分钟', steps: ['大腿前侧 1分钟', '大腿外侧 1分钟', '大腿后侧 1分钟', '臀部 1分钟', '小腿 1分钟', '背部 1分钟'] },
      { title: '静态拉伸 + 呼吸', time: '15 分钟', steps: ['下犬式', '鸽子式', '坐姿前屈', '青蛙趴', '婴儿式', '仰卧脊柱扭转', '腹式呼吸 3分钟', '站姿/坐姿放空恢复 2分钟'] },
    ],
  },
  周日: {
    badge: '恢复日',
    title: '主动恢复 + 可选有氧',
    subtitle: '全面放松，疲劳高就只做恢复',
    items: [
      { title: '可选有氧', time: '20-30 分钟', detail: '如果本周恢复良好，可做一次轻量有氧；如果疲劳明显，直接跳过有氧，只做放松。' },
      { title: '泡沫轴放松', time: '6 分钟', steps: ['大腿前侧 1分钟', '大腿外侧 1分钟', '大腿后侧 1分钟', '臀部 1分钟', '小腿 1分钟', '背部 1分钟'] },
      { title: '静态拉伸', time: '15 分钟', steps: ['下犬式', '鸽子式', '坐姿前屈', '青蛙趴', '婴儿式', '仰卧脊柱扭转', '颈部拉伸'] },
      { title: '呼吸放松', time: '8 分钟', steps: ['腹式呼吸 3分钟', '冥想 / 正念 5分钟'] },
    ],
  },
}

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


export function getTrainingPlan(weekday) {
  return trainingPlans[weekday] ?? trainingPlans.周三
}

export function getDietPlan(latest, weekday, trainingLabel, history = []) {
  const items = cloneItems([
    { time: '08:10', title: '早餐', detail: '西麦即食纯燕麦 50g + 牛奶 500ml' },
    { time: '早餐后', title: '补充', detail: '钙片 3粒 + 男士每日营养包 1袋 + 叶黄素 1粒 + 复合B族 1粒 + 鱼油 1粒 + 洋车前子壳粉 5g' },
    { time: '12:00', title: '午餐', detail: '高蛋白轻食套餐：鸡胸肉 150g + 杂粮饭 100g + 蔬菜 200g' },
    { time: '15:30', title: '下午加餐', detail: 'WonderLab 双层脆心谷物棒 2根' },
    { time: '运动前', title: '训练前补给', detail: '香蕉 1根' },
    { time: '训练后', title: '训练后补充', detail: '乳清蛋白粉 2.5 勺' },
    { time: '20:00', title: '晚餐', detail: '岩烤鸡胸 + 新鲜时蔬 + 杂粮饭套餐（含鸡蛋）' },
    { time: '晚餐后', title: '补充', detail: '钙片 3粒' },
  ])

  const reminders = [
    '午餐不要用代餐奶昔替代正餐。',
    '晚餐继续高蛋白，外卖统一备注少盐少油。',
  ]

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
  const preWorkout = items.find(item => item.title === '训练前补给')
  const postWorkout = items.find(item => item.title === '训练后补充')
  const dinner = items.find(item => item.title === '晚餐')

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

  if (trendSignals.length) {
    items.unshift({
      time: '趋势驱动',
      title: '最近趋势判断',
      detail: trendSignals.filter(Boolean).join('；') + '。',
      note: '这里优先看短中期趋势，而不是放大单次波动。',
    })
  }

  const longWindowSummary = [
    evidenceGroups?.baseline?.[0],
    evidenceGroups?.trend?.[0],
  ].filter(Boolean).join('；')

  const baselineBandSummary = [
    evidenceGroups?.baseline?.find(item => item.includes('波动带')),
    evidenceGroups?.baseline?.find(item => item.includes('相对个人基线')),
  ].filter(Boolean).join('；')

  if (baselineBandSummary) {
    items.unshift({
      time: '基线带',
      title: '个人波动带位置',
      detail: `${baselineBandSummary}。`,
      note: `当前训练负荷：${trainingLoadLabel}；今日 intake 策略：${intakeStrategy}。`,
    })
  }

  if (longWindowSummary) {
    items.unshift({
      time: '长窗口',
      title: '个人基线判断',
      detail: `${longWindowSummary}。`,
      note: '阶段二开始把最近记录放回个人基线里判断，减少“只看昨天 vs 今天”的误判。',
    })
  }

  items.unshift({
    time: '今日策略',
    title: '主策略模式',
    detail: summary,
    emphasis: `当前模式：${decisionBadge} · ${stageLabel} · ${trainingLoadLabel} · intake=${intakeStrategy} · 置信度 ${(confidence * 100).toFixed(0)}%`,
    note: evidence.length ? `证据：${evidence.join('；')}` : '当前记录数量不足时，以训练类型 + 最新体测做保守判断。',
  })

  const uniqueReminders = [...new Set(reminders.filter(Boolean))]
  const focusText = bodyFocus.length ? `当前重点：${[...new Set(bodyFocus)].join(' / ')}` : '当前重点：维持高蛋白 + 适度碳水 + 稳定执行'
  const trendText = trendSignals.length ? `趋势监测：${trendSignals.filter(Boolean).join('；')}` : '趋势监测：当前以多窗口保守判断为主，避免放大单次波动。'

  return {
    badge: decisionBadge,
    goal: '保肌肉 > 保代谢 > 温和减脂',
    subtitle: `${focusText} · ${trendText} · 当前处于 ${stageLabel}，负荷背景为 ${trainingLoadLabel}，今日 intake 策略为 ${intakeStrategy}，今天按 ${decisionBadge} 模式细化餐次，训练主题为 ${trainingLabel}。`,
    items,
    reminders: uniqueReminders,
    engine: rules.decision,
  }
}

const morningRoutine = [
  'B5洁面',
  '收敛水',
  'MELA B3 烟酰胺亮白精华',
  '水油平衡乳',
  'SPF50+ 防晒',
]

const eveningRoutine = {
  周一: {
    theme: '三酸精华夜',
    duration: '约 10-15 分钟',
    steps: ['清透洁面', '收敛水', '三酸精华', 'MELA B3 烟酰胺亮白精华', 'B5局部点涂（可选）', '水油平衡乳'],
    note: '属于功效夜，注意避开眼周。',
  },
  周二: {
    theme: '停三酸修护夜',
    duration: '约 8-12 分钟',
    steps: ['清透洁面', '收敛水', 'MELA B3 烟酰胺亮白精华', 'B5局部点涂（可选）', '水油平衡乳'],
    note: '给皮肤留恢复窗口。',
  },
  周三: {
    theme: '深度清洁夜',
    duration: '约 40-50 分钟',
    steps: ['清透洁面', '白泥面膜 10-15 分钟', '清痘面膜 15-20 分钟', '收敛水', 'MELA B3 烟酰胺亮白精华', 'B5局部点涂（可选）', '水油平衡乳'],
    note: '今天是主动恢复日，适合做每周一次深度清洁。',
    emphasis: '今晚不做三酸，重点做深度清洁 + 修护。',
  },
  周四: {
    theme: '三酸精华夜',
    duration: '约 10-15 分钟',
    steps: ['清透洁面', '收敛水', '三酸精华', 'MELA B3 烟酰胺亮白精华', 'B5局部点涂（可选）', '水油平衡乳'],
    note: '继续隔日使用三酸。',
  },
  周五: {
    theme: '停三酸修护夜',
    duration: '约 8-12 分钟',
    steps: ['清透洁面', '收敛水', 'MELA B3 烟酰胺亮白精华', 'B5局部点涂（可选）', '水油平衡乳'],
    note: '保持控油和淡痘印节奏。',
  },
  周六: {
    theme: '三酸精华夜',
    duration: '约 10-15 分钟',
    steps: ['清透洁面', '收敛水', '三酸精华', 'MELA B3 烟酰胺亮白精华', 'B5局部点涂（可选）', '水油平衡乳'],
    note: '固定有氧日后继续功效护理。',
  },
  周日: {
    theme: '停三酸修护夜',
    duration: '约 8-12 分钟',
    steps: ['清透洁面', '收敛水', 'MELA B3 烟酰胺亮白精华', 'B5全脸薄涂（可选）', '水油平衡乳'],
    note: '休息日以修护为主。',
  },
}

export function getSkincarePlan(weekday) {
  return {
    morning: morningRoutine,
    evening: eveningRoutine[weekday] ?? eveningRoutine.周三,
    reminders: [
      '油痘肌使用 B5 先乳化，优先局部薄涂。',
      '白天出门必须做足防晒，帽子/口罩属于加分项。',
      '出现泛红紧绷时，暂停三酸并切回修护模式。',
    ],
  }
}
