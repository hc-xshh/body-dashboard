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
export function generateAdvice(latest, prev) {
  const advice = []

  // 体脂率
  if (latest.bodyFat != null) {
    if (latest.bodyFat > 22) {
      advice.push({ level: 'bad', icon: '🔴', text: `体脂率 ${latest.bodyFat}% 偏高，建议每周保持 3 次以上有氧训练，控制精制碳水摄入。` })
    } else if (latest.bodyFat > 20) {
      advice.push({ level: 'warn', icon: '🟡', text: `体脂率 ${latest.bodyFat}% 轻度偏高，维持当前训练节奏，注意饮食油脂质量。` })
    } else {
      advice.push({ level: 'good', icon: '🟢', text: `体脂率 ${latest.bodyFat}% 处于正常区间，保持现有训练和饮食节律。` })
    }
  }

  // 内脏脂肪
  if (latest.visceralFat != null && latest.visceralFat >= 10) {
    advice.push({ level: 'warn', icon: '🟡', text: `内脏脂肪指数 ${latest.visceralFat}（偏高区间），建议增加有氧训练频率，减少晚餐热量，监控腰围变化。` })
  }

  // 水分
  if (latest.water != null && latest.water < 55) {
    advice.push({ level: 'warn', icon: '💧', text: `水分 ${latest.water}% 偏低，每日饮水量建议 2000ml+，训练日追加 500ml，避免睡前2h大量饮水。` })
  }

  // 基础代谢
  if (latest.bmr != null && latest.bmr < 1550) {
    advice.push({ level: 'warn', icon: '🔥', text: `基础代谢 ${latest.bmr} kcal 偏低，建议通过增肌训练（力量为主）拉升代谢基线，避免极低热量节食。` })
  }

  // 骨量
  if (latest.bone != null && latest.bone < 2.8) {
    advice.push({ level: 'bad', icon: '🦴', text: `骨量 ${latest.bone} kg 不足，建议补充钙 + 维生素D3，增加负重训练频率，减少高盐高糖食品。` })
  }

  // 趋势建议（对比上次）
  if (prev) {
    const fatDelta = latest.bodyFat != null && prev.bodyFat != null ? latest.bodyFat - prev.bodyFat : null
    const muscleDelta = latest.muscle != null && prev.muscle != null ? latest.muscle - prev.muscle : null

    if (fatDelta != null && muscleDelta != null) {
      if (fatDelta < 0 && muscleDelta > 0) {
        advice.push({ level: 'good', icon: '📈', text: `相比上次体脂 ${fatDelta.toFixed(1)}%、肌肉量 +${muscleDelta.toFixed(1)} kg，体成分正在向好方向改善！保持现有节律。` })
      } else if (fatDelta > 0.5 && muscleDelta < 0) {
        advice.push({ level: 'bad', icon: '📉', text: `相比上次体脂 +${fatDelta.toFixed(1)}%、肌肉量 ${muscleDelta.toFixed(1)} kg，需检查近期饮食执行和训练质量。` })
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
