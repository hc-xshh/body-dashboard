import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const readingGuideSource = readFileSync(new URL('../src/components/ReadingGuide.jsx', import.meta.url), 'utf8')
const trendChartSource = readFileSync(new URL('../src/components/TrendChart.jsx', import.meta.url), 'utf8')

test('reading guide removes serial numbers and extra helper hints to stay compact', () => {
  assert.doesNotMatch(readingGuideSource, /0\{index \+ 1\}/)
  assert.doesNotMatch(readingGuideSource, /滚动页面时会自动联动高亮/)
  assert.doesNotMatch(readingGuideSource, /左右滑动或点击跳转/)
})

test('trend section copy is shortened and latest-decision chips avoid duplicate mode label', () => {
  assert.doesNotMatch(appSource, /这里改成一张总趋势图：默认看体重、体脂、肌肉；你也可以多选别的指标一起看。手机端优先看上方结论卡，再按需切换曲线。/)
  assert.doesNotMatch(trendChartSource, /对应模式：/)
})

test('footer copy stays concise instead of explaining the whole pipeline', () => {
  assert.doesNotMatch(appSource, /数据由 Hermes Agent 自动解析体测截图生成 · 饮食\/训练\/护肤建议基于 Obsidian 现有方案 \+ 当日体测动态展示 · 仅供个人参考/)
})
