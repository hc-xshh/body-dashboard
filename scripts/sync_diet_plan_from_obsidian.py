#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path('/home/xs/body-dashboard')
SOURCE = Path('/home/xs/knowledge_workspace/health_vault/nutrition/daily-diet-plan-202604.md')
OUTPUT = REPO_ROOT / 'src/data/dietPlan.generated.json'


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


def strip_md(text: str) -> str:
    return (
        text.replace('<br>', '； ')
        .replace('**', '')
        .replace('✅', '')
        .replace('⚠️', '')
        .replace('❌', '')
        .replace('  ', ' ')
        .strip()
    )


def main() -> None:
    lines = SOURCE.read_text().splitlines()
    schedule_rows = None
    reminders = []
    for idx, line in enumerate(lines):
        if line.startswith('| 时间 | 餐次/环节 | 搭配 | 调整说明 |'):
            schedule_rows, _ = parse_table(lines, idx)
        if line.startswith('## 关键注意事项'):
            j = idx + 1
            while j < len(lines):
                raw = lines[j].strip()
                if raw.startswith('## '):
                    break
                if raw and raw[0].isdigit() and '. ' in raw:
                    reminders.append(strip_md(raw.split('. ', 1)[1]))
                j += 1
    if not schedule_rows:
        raise SystemExit('Diet schedule table not found')

    items = []
    for row in schedule_rows:
        time = strip_md(row.get('时间', ''))
        title = strip_md(row.get('餐次/环节', ''))
        detail = strip_md(row.get('搭配', ''))
        note = strip_md(row.get('调整说明', ''))
        if title == '-' or detail == '-':
            continue
        item = {
            'time': time,
            'title': title,
            'detail': detail,
        }
        if note and note != '-':
            item['note'] = note
        items.append(item)

    payload = {
        'goal': '保肌肉 > 保代谢 > 温和减脂',
        'subtitle': '基础版饮食执行单：再叠加体测规则引擎做当天微调。',
        'items': items,
        'reminders': reminders,
        'sourceNote': str(SOURCE),
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    print(f'Wrote {OUTPUT}')


if __name__ == '__main__':
    main()
