export function getTrainingContext(weekday) {
  return {
    strengthDay: ['周一', '周二', '周四', '周五'].includes(weekday),
    cardioDay: ['周三', '周六', '周日'].includes(weekday),
    lowerBodyDay: weekday === '周二',
    recoveryDay: ['周三', '周日'].includes(weekday),
  }
}
