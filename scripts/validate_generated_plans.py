#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path('/home/xs/body-dashboard')
DATA_DIR = REPO_ROOT / 'src/data'


def load(name: str):
    return json.loads((DATA_DIR / name).read_text())


def ensure(cond: bool, msg: str):
    if not cond:
        raise SystemExit(msg)


def main() -> None:
    training = load('trainingPlans.generated.json')
    diet = load('dietPlan.generated.json')
    skincare = load('skincarePlan.generated.json')
    weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

    for day in weekdays:
        ensure(day in training, f'training missing weekday: {day}')
        ensure(training[day].get('items'), f'training items empty: {day}')

    ensure(isinstance(diet.get('items'), list) and len(diet['items']) >= 6, 'diet items too few')
    required_titles = {'早餐', '午餐', '下午加餐', '训练前', '补充', '晚餐'}
    titles = {item.get('title') for item in diet['items']}
    ensure(any(t == '早餐' for t in titles), 'diet missing 早餐')
    ensure(any(t == '午餐' for t in titles), 'diet missing 午餐')
    ensure(any(t == '晚餐' for t in titles), 'diet missing 晚餐')
    ensure(diet.get('sourceNote'), 'diet missing sourceNote')

    ensure(isinstance(skincare.get('morning'), list) and len(skincare['morning']) >= 4, 'skincare morning steps invalid')
    ensure('防晒' in ''.join(skincare['morning']), 'skincare morning missing sunscreen step')
    ensure(skincare.get('sourceNote'), 'skincare missing sourceNote')
    for day in weekdays:
        ensure(day in skincare.get('evening', {}), f'skincare missing weekday: {day}')
        ensure(skincare['evening'][day].get('steps'), f'skincare steps empty: {day}')
        ensure(not any(step == '停三酸' for step in skincare['evening'][day].get('steps', [])), f'skincare still contains raw 停三酸 token: {day}')

    note_text = Path(skincare['sourceNote']).read_text()
    ensure('| 日期 | 训练安排 | 护肤安排 | 三酸 |' in note_text, 'skincare source note weekly plan table missing')

    diet_note = Path(diet['sourceNote']).read_text()
    ensure('| 时间 | 餐次/环节 | 搭配 | 调整说明 |' in diet_note, 'diet source note schedule table missing')

    print('SYNC VALIDATION: PASS')


if __name__ == '__main__':
    main()
