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

    training_note = Path('/home/xs/knowledge_workspace/health_vault/fitness/一周居家健身计划_哑铃版.md').read_text()
    ensure('BODY_DASHBOARD_SYNC_CONTRACT:BEGIN' in training_note, 'training source contract missing begin marker')
    ensure('contract_id: body-dashboard/training-plan' in training_note, 'training source contract id missing')
    ensure('禁止删除组间休息列' in training_note, 'training source guardrail text missing')
    ensure('AI_EDITABLE_SECTION:BEGIN training_weekday_blocks' in training_note, 'training editable section begin marker missing')
    ensure('AI_EDITABLE_SECTION:END training_weekday_blocks' in training_note, 'training editable section end marker missing')

    diet_note = Path(diet['sourceNote']).read_text()
    ensure('BODY_DASHBOARD_SYNC_CONTRACT:BEGIN' in diet_note, 'diet source contract missing begin marker')
    ensure('contract_id: body-dashboard/diet-plan' in diet_note, 'diet source contract id missing')
    ensure('只改餐单表里的时间、餐次、搭配、调整说明' in diet_note, 'diet source guardrail text missing')
    ensure('AI_EDITABLE_SECTION:BEGIN diet_schedule_table' in diet_note, 'diet editable section begin marker missing')
    ensure('AI_EDITABLE_SECTION:END diet_schedule_table' in diet_note, 'diet editable section end marker missing')

    skincare_note = Path(skincare['sourceNote']).read_text()
    ensure('BODY_DASHBOARD_SYNC_CONTRACT:BEGIN' in skincare_note, 'skincare source contract missing begin marker')
    ensure('contract_id: body-dashboard/skincare-plan' in skincare_note, 'skincare source contract id missing')
    ensure('晨间流程必须保留防晒作为最后一步' in skincare_note, 'skincare source guardrail text missing')
    ensure('AI_EDITABLE_SECTION:BEGIN skincare_morning_routine' in skincare_note, 'skincare morning editable section begin marker missing')
    ensure('AI_EDITABLE_SECTION:END skincare_morning_routine' in skincare_note, 'skincare morning editable section end marker missing')
    ensure('AI_EDITABLE_SECTION:BEGIN skincare_deep_clean_routine' in skincare_note, 'skincare deep clean editable section begin marker missing')
    ensure('AI_EDITABLE_SECTION:END skincare_deep_clean_routine' in skincare_note, 'skincare deep clean editable section end marker missing')
    ensure('AI_EDITABLE_SECTION:BEGIN skincare_weekly_table' in skincare_note, 'skincare weekly table editable section begin marker missing')
    ensure('AI_EDITABLE_SECTION:END skincare_weekly_table' in skincare_note, 'skincare weekly table editable section end marker missing')

    for day in weekdays:
        ensure(day in training, f'training missing weekday: {day}')
        ensure(training[day].get('items'), f'training items empty: {day}')
        for item in training[day].get('items', []):
            steps = item.get('steps', [])
            if item.get('title') in {'主训练', '腹肌', '腹肌专项'} and steps:
                ensure(any('秒' in step for step in steps), f'training rest annotation missing in {day} / {item.get("title")}')

    ensure(isinstance(diet.get('items'), list) and len(diet['items']) >= 6, 'diet items too few')
    required_titles = {'早餐', '午餐', '下午加餐', '训练前', '补充', '晚餐'}
    titles = {item.get('title') for item in diet['items']}
    ensure(any(t == '早餐' for t in titles), 'diet missing 早餐')
    ensure(any(t == '午餐' for t in titles), 'diet missing 午餐')
    ensure(any(t == '晚餐' for t in titles), 'diet missing 晚餐')
    ensure(diet.get('sourceNote'), 'diet missing sourceNote')
    ensure(any(item.get('title') == '补充' and item.get('time') == '训练后' and '蛋白' in item.get('detail', '') for item in diet['items']), 'diet missing post-workout protein slot')

    ensure(isinstance(skincare.get('morning'), list) and len(skincare['morning']) >= 4, 'skincare morning steps invalid')
    ensure('防晒' in ''.join(skincare['morning']), 'skincare morning missing sunscreen step')
    ensure(skincare.get('sourceNote'), 'skincare missing sourceNote')
    for day in weekdays:
        ensure(day in skincare.get('evening', {}), f'skincare missing weekday: {day}')
        ensure(skincare['evening'][day].get('steps'), f'skincare steps empty: {day}')
        ensure(not any(step == '停三酸' for step in skincare['evening'][day].get('steps', [])), f'skincare still contains raw 停三酸 token: {day}')

    ensure('| 日期 | 训练安排 | 护肤安排 | 三酸 |' in skincare_note, 'skincare source note weekly plan table missing')
    ensure('| 时间 | 餐次/环节 | 搭配 | 调整说明 |' in diet_note, 'diet source note schedule table missing')

    print('SYNC VALIDATION: PASS')


if __name__ == '__main__':
    main()
