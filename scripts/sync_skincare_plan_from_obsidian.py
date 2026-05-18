#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

REPO_ROOT = Path('/home/xs/body-dashboard')
SOURCE = Path('/home/xs/knowledge_workspace/health_vault/skincare/la-roche-posay-acne-routine.md')
OUTPUT = REPO_ROOT / 'src/data/skincarePlan.generated.json'

WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']


def parse_table(lines: list[str], start: int) -> tuple[list[dict[str, str]], int]:
    headers = [cell.strip() for cell in lines[start].strip().strip('|').split('|')]
    rows: list[dict[str, str]] = []
    idx = start + 2
    while idx < len(lines):
        line = lines[idx].rstrip('\n')
        if not line.strip().startswith('|'):
            break
        cells = [cell.strip() for cell in line.strip().strip('|').split('|')]
        if len(cells) == len(headers):
            rows.append(dict(zip(headers, cells)))
        idx += 1
    return rows, idx


def extract_fenced_steps(text: str, heading: str) -> list[str]:
    pattern = re.compile(rf'###\s*{re.escape(heading)}\s*\n(?:<!--.*?-->\s*\n|\s*\n)*```\n(.*?)\n```', re.S)
    match = pattern.search(text)
    if not match:
        raise SystemExit(f'Missing fenced routine block for {heading}')
    steps = []
    for raw in match.group(1).splitlines():
        raw = raw.strip()
        if not raw:
            continue
        cleaned = re.sub(r'^\d+\.\s*', '', raw)
        cleaned = cleaned.split('→', 1)[0].strip()
        steps.append(cleaned)
    return steps


def clean_text(text: str) -> str:
    return text.replace('**', '').replace('<br>', '； ').replace('•', '').strip()


STEP_NORMALIZATION = {
    'B5洁面': '新B5+舒缓泡沫洁面啫喱',
    '清透洁面': '清透净油洁面泡沫',
    '收敛水': '微晶焕肤收敛水',
    '三酸精华': '焕肤三酸精华液',
    '美白': 'MELA B3 烟酰胺亮白精华',
    '水油平衡乳': '清痘净肤水油平衡乳',
    '(B5点涂)': 'B5多效舒缓修护霜（可选局部点涂）',
    '(可选B5点涂)': 'B5多效舒缓修护霜（可选局部点涂）',
    '(可选B5全脸薄涂)': 'B5多效舒缓修护霜（可选全脸薄涂）',
    '白泥面膜(10-15min)': '净肤祛油白泥面膜 10-15 分钟',
    '清痘面膜(15min)': '清痘净肤面膜 15 分钟',
}


def derive_theme(plan: str) -> str:
    if '白泥面膜' in plan or '清痘面膜' in plan:
        return '深度清洁夜'
    if '三酸精华' in plan:
        return '三酸精华夜'
    return '停三酸修护夜'


def derive_duration(plan: str) -> str:
    if '白泥面膜' in plan or '清痘面膜' in plan:
        return '约 40-50 分钟'
    if '三酸精华' in plan:
        return '约 10-15 分钟'
    return '约 8-12 分钟'


def parse_plan_steps(plan: str) -> list[str]:
    chunks = [c.strip() for c in plan.split('→')]
    steps = []
    for chunk in chunks:
        chunk = clean_text(chunk)
        if not chunk:
            continue
        if chunk.startswith('晨间：') or chunk.startswith('夜间：'):
            chunk = chunk.split('：', 1)[1].strip()
        if chunk == '停三酸':
            continue
        chunk = STEP_NORMALIZATION.get(chunk, chunk)
        steps.append(chunk)
    return steps


def main() -> None:
    text = SOURCE.read_text()
    lines = text.splitlines()

    morning = extract_fenced_steps(text, '晨间')
    reminders = []
    for idx, line in enumerate(lines):
        if line.startswith('## 核心原则'):
            j = idx + 1
            while j < len(lines):
                raw = lines[j].rstrip('\n')
                if raw.startswith('## '):
                    break
                if raw.strip().startswith('- '):
                    reminders.append(clean_text(raw.strip()[2:]))
                j += 1
            break

    weekly_rows = None
    for idx, line in enumerate(lines):
        if line.startswith('| 日期 | 训练安排 | 护肤安排 | 三酸 |'):
            weekly_rows, _ = parse_table(lines, idx)
            break
    if not weekly_rows:
        raise SystemExit('Weekly skincare plan table not found')

    evening = {}
    training_labels = {}
    for row in weekly_rows:
        weekday = clean_text(row.get('日期', '')).replace('*', '')
        weekday = weekday.strip()
        if weekday not in WEEKDAYS:
            continue
        training_labels[weekday] = clean_text(row.get('训练安排', ''))
        plan = clean_text(row.get('护肤安排', ''))
        plan = plan.split('夜间：', 1)[1].strip() if '夜间：' in plan else plan
        steps = parse_plan_steps(plan)
        note = ''
        if weekday == '周三':
            note = '今天是主动恢复日，适合做每周一次深度清洁。'
        elif weekday == '周日':
            note = '休息日以修护为主。'
        elif '三酸精华' in plan:
            note = '属于功效夜，注意避开眼周。' if weekday == '周一' else '继续隔日使用三酸。'
        else:
            note = '给皮肤留恢复窗口。' if weekday == '周二' else '保持控油和淡痘印节奏。'
        item = {
            'theme': derive_theme(plan),
            'duration': derive_duration(plan),
            'steps': steps,
            'note': note,
            'trainingLabel': training_labels[weekday],
        }
        if weekday == '周三':
            item['emphasis'] = '今晚不做三酸，重点做深度清洁 + 修护。'
        evening[weekday] = item

    missing = [day for day in WEEKDAYS if day not in evening]
    if missing:
        raise SystemExit(f'Missing skincare weekdays: {missing}')

    payload = {
        'morning': morning,
        'evening': evening,
        'reminders': reminders,
        'sourceNote': str(SOURCE),
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    print(f'Wrote {OUTPUT}')


if __name__ == '__main__':
    main()
