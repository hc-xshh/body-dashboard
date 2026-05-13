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
      { title: '主训练', time: '约 25-35 分钟', steps: ['俯卧撑（手放哑铃上）3×10-15', '哑铃推举（坐姿）3×12', '哑铃侧平举 3×15', '钻石俯卧撑 3×8-12', '俯身哑铃划船 3×12/臂'] },
      { title: '腹肌', time: '训练后', steps: ['哑铃卷腹 3×15'] },
      { title: '拉伸', time: '5-10 分钟', steps: ['门框胸肌拉伸', '过头三头拉伸', '交叉肩后束拉伸', '婴儿式'] },
    ],
  },
  周二: {
    badge: '力量日',
    title: '下肢 + 下腹',
    subtitle: '腿 / 臀 + 下腹直肌',
    items: [
      { title: '热身', time: '5-8 分钟', steps: ['原地高抬腿 30秒', '髋关节环绕 每侧10次', '徒手深蹲 2×10', '弓步转体 每侧8次', '臀桥 2×10', '单腿平衡 每侧20秒'] },
      { title: '主训练', time: '约 30-40 分钟', steps: ['高脚杯深蹲（壶铃）4×12', '保加利亚分腿蹲 3×10/腿', '箭步蹲（手持哑铃）3×8/腿', '罗马尼亚硬拉（哑铃）3×12', '壶铃摆荡 3×15-20', '平板支撑 3×45秒', '死虫式 3×10/侧'] },
      { title: '腹肌', time: '训练后', steps: ['反向卷腹 3×12'] },
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
      { title: '主训练', time: '约 25-35 分钟', steps: ['俯身宽握哑铃划船 4×12', '单臂哑铃划船 3×12/臂', '双手哑铃俯身划船 3×15', '哑铃弯举 3×15', '锤式弯举 3×12'] },
      { title: '腹肌', time: '训练后', steps: ['俄罗斯转体（持哑铃）3×20'] },
      { title: '拉伸', time: '5-10 分钟', steps: ['婴儿式', '二头肌拉伸（靠墙）', '抱膝滚动', '颈部侧屈拉伸'] },
    ],
  },
  周五: {
    badge: '力量日',
    title: '肩部专项 + 腹肌专项',
    subtitle: '肩部强化 + 腹肌全面刺激',
    items: [
      { title: '热身', time: '5-8 分钟', steps: ['肩部环绕 前后各15次', '手臂画圈 前后各10次', '弹力带肩外旋 2×15', '俯身Y字上举 2×15', '俯身W字收缩 2×15', '墙壁俯卧撑 2×10', '死虫式 1×10'] },
      { title: '主训练', time: '约 20-30 分钟', steps: ['阿诺德推举 3×12', '哑铃前平举 3×12', '俯身哑铃飞鸟 3×15'] },
      { title: '腹肌专项', time: '15 分钟', steps: ['卷腹 3×15', '反向卷腹 3×15', '俄罗斯转体 3×20', '侧平板支撑 3×30秒/侧', '平板支撑 2×60秒'] },
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

function getRecentSeries(history, key, limit = 4) {
  return history
    .filter(item => item?.[key] != null)
    .slice(0, limit)
    .map(item => item[key])
}

function getDelta(series) {
  if (series.length < 2) return null
  return series[0] - series[series.length - 1]
}

function isStrictRising(series) {
  return series.length >= 3 && series.every((value, index) => index === 0 || series[index - 1] >= value) && series[0] > series[series.length - 1]
}

function isStrictFalling(series) {
  return series.length >= 3 && series.every((value, index) => index === 0 || series[index - 1] <= value) && series[0] < series[series.length - 1]
}

function formatSigned(value, digits = 1) {
  if (value == null) return null
  const abs = Math.abs(value).toFixed(digits)
  if (Math.abs(value) < 0.05) return '≈0'
  return `${value > 0 ? '+' : '-'}${abs}`
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

  const bodyFocus = []
  const trendSignals = []
  const strategySignals = []

  const weightSeries = getRecentSeries(history, 'weight')
  const fatSeries = getRecentSeries(history, 'bodyFat')
  const muscleSeries = getRecentSeries(history, 'muscle')
  const waterSeries = getRecentSeries(history, 'water')
  const bmrSeries = getRecentSeries(history, 'bmr')

  const weightDelta = getDelta(weightSeries)
  const fatDelta = getDelta(fatSeries)
  const muscleDelta = getDelta(muscleSeries)
  const waterDelta = getDelta(waterSeries)
  const bmrDelta = getDelta(bmrSeries)

  const fatRising = isStrictRising(fatSeries)
  const fatFalling = isStrictFalling(fatSeries)
  const muscleFalling = isStrictFalling(muscleSeries)
  const waterFalling = isStrictFalling(waterSeries)
  const bmrFalling = isStrictFalling(bmrSeries)

  const strengthDay = isStrengthDay(weekday)
  const cardioDay = isCardioDay(weekday)
  const lowerBodyDay = isLowerBodyDay(weekday)
  const recoveryDay = isRecoveryDay(weekday)

  const weightDown = weightDelta != null && weightDelta < -0.4
  const weightUp = weightDelta != null && weightDelta > 0.4
  const fatMeaningfulUp = fatDelta != null && fatDelta > 0.6
  const fatMeaningfulDown = fatDelta != null && fatDelta < -0.6
  const muscleMeaningfulDown = muscleDelta != null && muscleDelta < -0.8

  const lunch = items.find(item => item.title === '午餐')
  const snack = items.find(item => item.title === '下午加餐')
  const preWorkout = items.find(item => item.title === '训练前补给')
  const postWorkout = items.find(item => item.title === '训练后补充')
  const dinner = items.find(item => item.title === '晚餐')

  if (fatSeries.length >= 3) {
    if (fatRising) {
      trendSignals.push(`最近 ${fatSeries.length} 次体脂率呈上行，累计 ${formatSigned(fatDelta)}%`)
    } else if (fatFalling) {
      trendSignals.push(`最近 ${fatSeries.length} 次体脂率呈下行，累计 ${formatSigned(fatDelta)}%`)
    }
  }

  if (waterSeries.length >= 3 && waterFalling) {
    trendSignals.push(`最近 ${waterSeries.length} 次水分持续走低，累计 ${formatSigned(waterDelta)}%`)
  }

  if (muscleSeries.length >= 3 && muscleFalling && (fatRising || bmrFalling)) {
    trendSignals.push(`肌肉量最近 ${muscleSeries.length} 次累计 ${formatSigned(muscleDelta)}kg，且伴随体脂/代谢走弱`)
  }

  if (weightSeries.length >= 3 && weightDown && fatMeaningfulUp) {
    trendSignals.push(`最近 ${weightSeries.length} 次体重累计 ${formatSigned(weightDelta)}kg，但体脂没有同步回落`)
  } else if (weightSeries.length >= 3 && weightUp && fatMeaningfulDown) {
    trendSignals.push(`最近 ${weightSeries.length} 次体重累计 ${formatSigned(weightDelta)}kg，但体脂在回落，更像训练恢复波动`)
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
    strategySignals.push('今天是下肢高消耗日：午餐和训练前碳水上调一档，晚餐不做极端收口。')
    reminders.push('下肢日不要一边做高训练量，一边又把主食压得太低。')
  } else if (strengthDay) {
    lunch.detail = '高蛋白轻食套餐：鸡胸肉 150g + 杂粮饭 100-120g + 蔬菜 200g'
    snack.detail = 'WonderLab 双层脆心谷物棒 2根'
    snack.note = '力量日加餐维持 2 根，不靠主观感觉减少。'
    preWorkout.detail = '香蕉 1根 + 如训练前偏饿可加 1 根谷物棒'
    preWorkout.note = '力量日优先保证训练前碳水，不要空腹硬练。'
    postWorkout.detail = '乳清蛋白粉 2.5 勺'
    postWorkout.note = `今天是 ${trainingLabel}，训练后优先保蛋白。`
    strategySignals.push('今天是力量日：午餐和训练前补给保持完整，先保证训练质量。')
    reminders.push('力量日谷物棒固定 2 根，除非你今天根本不训练。')
  } else if (cardioDay) {
    snack.detail = recoveryDay ? 'WonderLab 双层脆心谷物棒 1根' : 'WonderLab 双层脆心谷物棒 1-2根'
    snack.note = recoveryDay ? '恢复日控制为 1 根，避免把轻训练日吃成补偿日。' : '有氧日按饥饿程度在 1-2 根之间调整，但默认先从 1 根开始。'
    preWorkout.detail = recoveryDay ? '如果做有氧：香蕉 1根；如果只做恢复：可不额外补给' : '香蕉 1根（有氧前 20-40 分钟）'
    preWorkout.note = '今天不是重力量日，训练前补给以轻量易消化为主。'
    postWorkout.detail = '乳清蛋白粉 2-2.5 勺'
    postWorkout.note = '即使今天是恢复/有氧，也保留蛋白补充，避免代谢继续往下掉。'
    strategySignals.push(recoveryDay ? '今天是恢复日：加餐和训练前补给收一点，但蛋白和正餐不省。' : '今天是有氧日：碳水略收，但保留蛋白和基础恢复。')
    reminders.push(recoveryDay ? '恢复日不要把零食当奖励补回来。' : '有氧日减少的是额外零食，不是正餐蛋白。')
  }

  if ((latest?.bodyFat ?? 0) > 22) {
    dinner.emphasis = '体脂率偏高：晚餐保留蛋白和蔬菜，杂粮饭控在套餐标准量，不加甜饮和夜宵。'
    reminders.push('今天的减脂重点不是少吃到极端，而是去掉多余油脂、甜饮、夜宵。')
    bodyFocus.push('体脂率偏高')
  } else if ((latest?.bodyFat ?? 0) > 20) {
    dinner.emphasis = '体脂率轻度偏高：维持杂粮饭标准份量，不额外加炸物和高糖饮料。'
    bodyFocus.push('体脂率轻度偏高')
  }

  if (fatRising) {
    reminders.push('体脂最近几次在上行，今天把额外零食、甜饮、酒精全部视为可删项。')
  } else if (fatFalling) {
    reminders.push('体脂趋势在回落，今天重点是稳定执行，不要因为状态变好就放松晚间饮食。')
  }

  if ((latest?.visceralFat ?? 0) >= 10) {
    lunch.emphasis = '内脏脂肪偏高：午餐照常吃，但优先鸡胸肉 + 蔬菜，避免高油酱汁和双份主食。'
    reminders.push('内脏脂肪偏高时，先控晚间额外摄入，不要再加零食和酒精。')
    bodyFocus.push('内脏脂肪偏高')
  }

  if ((latest?.water ?? 100) < 55) {
    items.splice(Math.min(items.length, trendSignals.length ? 6 : 5), 0, {
      time: '16:30',
      title: '补水检查点',
      detail: '补 400-500ml 水，避免把全天饮水都堆到晚上。',
      emphasis: '你当前水分偏低，今天补水是硬任务，不是可选项。',
    })
    reminders.push('全天饮水 2200ml 左右，分 8-10 次喝，训练日额外补 500ml。')
    bodyFocus.push('水分偏低')
  }

  if (waterFalling) {
    reminders.push('水分最近几次持续下滑，今天下午那次补水检查点不要跳过。')
  }

  if ((latest?.bmr ?? 9999) < 1550) {
    lunch.note = `${lunch.note ? `${lunch.note} ` : ''}基础代谢偏低，午餐必须是正经正餐，不能省。`
    reminders.push('基础代谢偏低时，不要为了掉秤继续把热量压得更低。')
    bodyFocus.push('基础代谢偏低')
  }

  if (bmrFalling) {
    reminders.push(`基础代谢最近几次累计 ${formatSigned(bmrDelta, 0)} kcal，优先守住午餐质量和训练后蛋白。`)
  }

  if ((latest?.bone ?? 999) < 2.8) {
    reminders.push('骨量不足，早晚钙片继续按 3+3 执行，不随意漏掉。')
    bodyFocus.push('骨量不足')
  }

  if (weightDown && fatMeaningfulUp) {
    lunch.emphasis = `${lunch.emphasis ? `${lunch.emphasis} ` : ''}这几次更像掉水/掉瘦体重，不要继续压低主食和蛋白。`
    postWorkout.emphasis = '体重在掉但体脂没同步改善，训练后蛋白必须保住。'
    strategySignals.push('体重在降但体脂没降：今天不要继续“吃更少”，重点改成稳蛋白、稳补水、删零食。')
    reminders.push('体重下降不等于减脂成功；如果体脂没同步回落，先别继续加大热量缺口。')
  }

  if (weightUp && fatMeaningfulUp) {
    snack.detail = recoveryDay ? 'WonderLab 双层脆心谷物棒 0-1根' : 'WonderLab 双层脆心谷物棒 1根'
    snack.emphasis = '最近体重和体脂一起上行，今天先从下午加餐和晚间额外摄入收口。'
    dinner.note = '如果晚餐后还想吃东西，优先直接结束进食，不开第二轮零食。'
    strategySignals.push('体重和体脂一起上行：今天优先削掉加餐冗余和晚间额外热量。')
  }

  if (weightUp && fatMeaningfulDown) {
    strategySignals.push('体重小涨但体脂在降，更像训练恢复或糖原回补，今天不要误判成必须大幅减量。')
    reminders.push('如果今天训练质量不错且体脂在回落，不要因为体重小涨就极端减餐。')
  }

  if (weightDown && fatMeaningfulDown) {
    strategySignals.push('体重和体脂都在回落：方向是对的，今天以稳定执行为主，不做额外极端收口。')
  }

  if (muscleMeaningfulDown && fatRising) {
    reminders.push('肌肉和体脂组合变差时，优先删甜饮/零食，而不是删正餐蛋白。')
  }

  if (muscleFalling && (fatRising || bmrFalling)) {
    reminders.push('肌肉量连续走弱且伴随体脂/代谢信号变差，今天尤其不能省午餐和训练后蛋白。')
  }

  if (trendSignals.length) {
    items.unshift({
      time: '趋势驱动',
      title: '最近趋势判断',
      detail: trendSignals.join('；') + '。',
      note: '这张卡不只看今天一次体测，而是参考最近几次记录。',
    })
  }

  if (strategySignals.length) {
    items.unshift({
      time: '今日策略',
      title: '餐次调节重点',
      detail: strategySignals.join('；') + '。',
      note: '这是在固定饮食模板之上，再按训练强度 + 最近几次体测做的二次微调。',
    })
  }

  const uniqueReminders = [...new Set(reminders)]
  const focusText = bodyFocus.length ? `当前重点：${bodyFocus.join(' / ')}` : '当前重点：维持高蛋白 + 适度碳水 + 稳定执行'
  const trendText = trendSignals.length ? `趋势监测：${trendSignals.join('；')}` : '趋势监测：当前记录数量不足，先按单次体测 + 今日训练类型定制。'

  return {
    badge: strategySignals.length || trendSignals.length ? '精细定制' : '动态定制',
    goal: '保肌肉 > 保代谢 > 温和减脂',
    subtitle: `${focusText} · ${trendText} · 已按今天的 ${trainingLabel}、训练强度和最近几次体测组合自动细化餐次。`,
    items,
    reminders: uniqueReminders,
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
