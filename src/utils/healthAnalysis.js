import { analyzeBodySignals } from './rulesEngine'


// 判断指标状态
export const STATUS = {
  GOOD: 'good',
  WARN: 'warn',
  BAD: 'bad',
  NA: 'na',
}

export function getBodyFatStatus(v) {
  if (v == null) return STATUS.NA
  if (v < 10) return STATUS.WARN      // 偏低
  if (v <= 20) return STATUS.GOOD     // 正常
  if (v <= 25) return STATUS.WARN     // 偏高
  return STATUS.BAD
}

export function getVisceralFatStatus(v) {
  if (v == null) return STATUS.NA
  if (v <= 9) return STATUS.GOOD
  if (v <= 14) return STATUS.WARN
  return STATUS.BAD
}

export function getWaterStatus(v) {
  if (v == null) return STATUS.NA
  if (v >= 55) return STATUS.GOOD
  if (v >= 50) return STATUS.WARN
  return STATUS.BAD
}

export function getBMRStatus(v) {
  if (v == null) return STATUS.NA
  if (v >= 1600) return STATUS.GOOD
  if (v >= 1500) return STATUS.WARN
  return STATUS.BAD
}

export function getBoneStatus(v) {
  if (v == null) return STATUS.NA
  if (v >= 3.0) return STATUS.GOOD
  if (v >= 2.8) return STATUS.WARN
  return STATUS.BAD
}

export function getScoreStatus(v) {
  if (v == null) return STATUS.NA
  if (v >= 80) return STATUS.GOOD
  if (v >= 70) return STATUS.WARN
  return STATUS.BAD
}

// 生成健康建议
export function generateAdvice(latest, prev, history = [], currentWeekday = null) {
  const advice = []
  const weekday = currentWeekday ?? latest?.weekday ?? '周三'
  const trainingContext = {
    strengthDay: ['周一', '周二', '周四', '周五'].includes(weekday),
    cardioDay: ['周三', '周六', '周日'].includes(weekday),
    lowerBodyDay: weekday === '周二',
    recoveryDay: ['周三', '周日'].includes(weekday),
  }
  const seriesHistory = history.length ? history : [latest, prev].filter(Boolean)
  const analysis = analyzeBodySignals(latest, seriesHistory, trainingContext)
  const { primaryMode } = analysis.decision

  const modeAdvice = {
    protect_metabolism: { level: 'warn', icon: '🛡️', text: '当前优先保护代谢与瘦体重：先稳住午餐、训练前补给和训练后蛋白，不因为短期波动继续激进减餐。' },
    tighten_intake: { level: 'warn', icon: '✂️', text: '当前更适合收紧额外热量：优先削减下午加餐冗余、甜饮和晚间多余摄入，不动核心正餐蛋白。' },
    recovery_first: { level: 'good', icon: '🧘', text: '当前更像恢复优先阶段：今天以恢复和稳定执行为主，不把恢复波动误判成必须大幅减量。' },
    observe_noise: { level: 'warn', icon: '🫧', text: '当前数据噪声偏高：先看连续趋势，不根据单次高噪声指标波动做大动作。' },
    hold_course: { level: 'good', icon: '✅', text: '当前方向基本正常：继续保持训练节律、蛋白摄入和晚间收口即可。' },
  }

  advice.push(modeAdvice[primaryMode] ?? modeAdvice.hold_course)

  if (latest.bodyFat != null) {
    if (latest.bodyFat > 22) {
      advice.push({ level: 'bad', icon: '🔴', text: `体脂率 ${latest.bodyFat}% 偏高，重点不是极端少吃，而是减少甜饮、夜宵和额外油脂。` })
    } else if (latest.bodyFat > 20) {
      advice.push({ level: 'warn', icon: '🟡', text: `体脂率 ${latest.bodyFat}% 轻度偏高，维持训练节奏即可，优先保证饮食结构稳定。` })
    } else {
      advice.push({ level: 'good', icon: '🟢', text: `体脂率 ${latest.bodyFat}% 处于正常区间，继续保持当前节律。` })
    }
  }

  if (latest.visceralFat != null && latest.visceralFat >= 10) {
    advice.push({ level: 'warn', icon: '🟡', text: `内脏脂肪指数 ${latest.visceralFat} 偏高，建议继续增加有氧频率，并严格控制晚间额外摄入。` })
  }

  if (latest.water != null && latest.water < 55) {
    advice.push({ level: 'warn', icon: '💧', text: `水分 ${latest.water}% 偏低。水分属于高噪声指标，但连续偏低时仍应把分次补水执行到位。` })
  }

  if (latest.bmr != null && latest.bmr < 1550) {
    advice.push({ level: 'warn', icon: '🔥', text: `基础代谢 ${latest.bmr} kcal 偏低，建议优先保护午餐质量和训练后蛋白，避免继续压低热量。` })
  }

  if (latest.bone != null && latest.bone < 2.8) {
    advice.push({ level: 'bad', icon: '🦴', text: `骨量 ${latest.bone} kg 不足，继续补钙并维持负重训练，单次波动不必过度解读。` })
  }

  if (prev) {
    const fatDelta = latest.bodyFat != null && prev.bodyFat != null ? latest.bodyFat - prev.bodyFat : null
    const muscleDelta = latest.muscle != null && prev.muscle != null ? latest.muscle - prev.muscle : null

    if (fatDelta != null && muscleDelta != null) {
      if (fatDelta < 0 && muscleDelta > 0) {
        advice.push({ level: 'good', icon: '📈', text: `相比上次体脂 ${fatDelta.toFixed(1)}%、肌肉量 +${muscleDelta.toFixed(1)} kg，体成分方向在改善。` })
      } else if (fatDelta > 0.5 && muscleDelta < 0) {
        advice.push({ level: 'bad', icon: '📉', text: `相比上次体脂 +${fatDelta.toFixed(1)}%、肌肉量 ${muscleDelta.toFixed(1)} kg，近期更需要检查饮食执行和恢复质量。` })
      }
    }
  }

  return advice
}

// 获取趋势数据（按日期升序）
export function getTrendData(data, key) {
  return [...data]
    .filter(d => d[key] != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({ date: d.date, value: d[key] }))
}

export const STATUS_COLOR = {
  good: '#22c55e',
  warn: '#f59e0b',
  bad: '#ef4444',
  na: '#6b7280',
}

export const STATUS_LABEL = {
  good: '正常',
  warn: '偏高/偏低',
  bad: '异常',
  na: '无数据',
}
