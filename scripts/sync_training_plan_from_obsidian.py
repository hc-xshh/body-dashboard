#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

REPO_ROOT = Path('/home/xs/body-dashboard')
SOURCE = Path('/home/xs/knowledge_workspace/health_vault/fitness/一周居家健身计划_哑铃版.md')
OUTPUT = REPO_ROOT / 'src/data/trainingPlans.generated.json'

WEEKDAY_META = {
    '周一': {'badge': '力量日', 'title': '推力 + 上腹', 'subtitle': '胸 / 肩 / 三头 + 上腹直肌'},
    '周二': {'badge': '力量日', 'title': '下肢 + 下腹', 'subtitle': '腿 / 臀 + 下腹直肌'},
    '周三': {'badge': '恢复日', 'title': '主动恢复 + 有氧', 'subtitle': '放松肌肉、促进恢复、继续压内脏脂肪'},
    '周四': {'badge': '力量日', 'title': '拉力 + 腹斜肌', 'subtitle': '背 / 二头 + 腹斜肌'},
    '周五': {'badge': '力量日', 'title': '肩部专项 + 腹肌专项', 'subtitle': '肩部强化 + 腹肌全面刺激'},
    '周六': {'badge': '有氧日', 'title': '固定有氧 + 主动恢复', 'subtitle': '提升心肺、增加热量消耗、不叠加过多疲劳'},
    '周日': {'badge': '恢复日', 'title': '主动恢复 + 可选有氧', 'subtitle': '全面放松，疲劳高就只做恢复'},
}

TRAINING_HEADERS = {
    '周一:推力 + 腹肌上腹': '周一',
    '周二:下肢 + 腹肌下腹': '周二',
    '周三：主动恢复 + 有氧': '周三',
    '周四:拉力 + 腹肌旋转': '周四',
    '周五:肩部专项 + 腹肌专项': '周五',
    '周六:固定有氧 + 主动恢复': '周六',
    '周日：主动恢复 + 可选有氧': '周日',
}

TIME_MAP = {
    '周一': {'热身': '5-8 分钟', '主训练': '约 25-35 分钟', '腹肌': '训练后', '拉伸': '5-10 分钟'},
    '周二': {'热身': '5-8 分钟', '主训练': '约 30-40 分钟', '腹肌': '训练后', '拉伸': '5-10 分钟'},
    '周三': {'有氧运动': '30 分钟', '泡沫轴放松': '6 分钟', '静态拉伸': '10 分钟', '呼吸放松': '3 分钟'},
    '周四': {'热身': '5-8 分钟', '主训练': '约 25-35 分钟', '腹肌': '训练后', '拉伸': '5-10 分钟'},
    '周五': {'热身': '5-8 分钟', '主训练': '约 20-30 分钟', '腹肌专项': '15 分钟', '拉伸': '5-10 分钟'},
    '周六': {'热身': '5-8 分钟', '有氧运动': '30 分钟', '泡沫轴放松': '6 分钟', '静态拉伸 + 呼吸': '15 分钟'},
    '周日': {'可选有氧': '20-30 分钟', '泡沫轴放松': '6 分钟', '静态拉伸': '15 分钟', '呼吸放松': '8 分钟'},
}

REST_SUFFIX_RE = re.compile(r'([（(]持哑铃[）)])')


def normalize_exercise_name(name: str) -> str:
    name = name.strip()
    name = name.replace('(手放哑铃上)', '（手放哑铃上）')
    name = name.replace('(坐姿)', '（坐姿）')
    name = name.replace('(健身椅支撑)', '（健身椅支撑）')
    name = name.replace('(持哑铃)', '（持哑铃）')
    return name


def append_rest(name: str, rest: str | None) -> str:
    name = normalize_exercise_name(name)
    if not rest:
        return name
    return f'{name}，{rest}'


def parse_markdown_table(lines: list[str], start_idx: int) -> tuple[list[dict[str, str]], int]:
    header_line = lines[start_idx].strip()
    headers = [cell.strip() for cell in header_line.strip('|').split('|')]
    rows: list[dict[str, str]] = []
    idx = start_idx + 2
    while idx < len(lines):
        line = lines[idx].rstrip('\n')
        if not line.strip().startswith('|'):
            break
        cells = [cell.strip() for cell in line.strip().strip('|').split('|')]
        if len(cells) == len(headers):
            rows.append(dict(zip(headers, cells)))
        idx += 1
    return rows, idx


def extract_sections(lines: list[str], weekday: str) -> dict[str, dict]:
    sections: dict[str, dict] = {}
    idx = 0
    current_section = None
    while idx < len(lines):
        line = lines[idx].rstrip('\n')
        if line.startswith('### '):
            current_section = line[4:].strip()
            if current_section == '腹肌(训练后)':
                current_section = '腹肌'
            sections[current_section] = {'detail_lines': [], 'table_rows': []}
            idx += 1
            continue
        if current_section and line.strip().startswith('|') and idx + 1 < len(lines) and lines[idx + 1].strip().startswith('|------'):
            rows, idx = parse_markdown_table(lines, idx)
            sections[current_section]['table_rows'] = rows
            continue
        if current_section:
            if line.strip() and not line.startswith('---') and not line.startswith('## '):
                sections[current_section]['detail_lines'].append(line.strip())
        idx += 1
    return sections


def rows_to_steps(rows: list[dict[str, str]], name_key: str, rep_key: str, rest_key: str | None = None) -> list[str]:
    steps = []
    for row in rows:
        name = row.get(name_key, '').strip()
        reps = row.get(rep_key, '').strip()
        rest = row.get(rest_key, '').strip() if rest_key and row.get(rest_key) else None
        if not name:
            continue
        if reps:
            steps.append(append_rest(f'{name} {reps}', rest))
        else:
            steps.append(name)
    return steps


def build_weekday_plan(weekday: str, block: str) -> dict:
    lines = block.splitlines()
    sections = extract_sections(lines, weekday)
    meta = WEEKDAY_META[weekday]
    items = []

    def add_item(title: str, section_key: str, *, row_name='动作', row_rep='组数×次数', rest_key='组间休息', detail_mode=False, force_title: str | None = None):
        section = sections.get(section_key)
        if not section:
            return
        item_title = force_title or title
        item = {'title': item_title}
        time_value = TIME_MAP.get(weekday, {}).get(item_title) or TIME_MAP.get(weekday, {}).get(section_key)
        if time_value:
            item['time'] = time_value
        rows = section.get('table_rows') or []
        detail_lines = section.get('detail_lines') or []
        if detail_mode and detail_lines:
            item['detail'] = ' '.join(line.lstrip('- ').strip() for line in detail_lines)
        elif rows:
            if row_rep in rows[0]:
                item['steps'] = rows_to_steps(rows, row_name, row_rep, rest_key)
            elif '时间/次数' in rows[0]:
                item['steps'] = [f"{row['动作']} {row['时间/次数']}" for row in rows if row.get('动作')]
            elif '时间' in rows[0] and '动作' in rows[0]:
                item['steps'] = [f"{row['动作']} {row['时间']}" for row in rows if row.get('动作')]
            elif '选项' in rows[0] and '时长' in rows[0]:
                item['steps'] = [f"{row['选项']}（{row['时长']}）" for row in rows if row.get('选项')]
        elif detail_lines:
            item['steps'] = [line.lstrip('- ').strip() for line in detail_lines]
        if 'steps' in item or 'detail' in item:
            items.append(item)

    if weekday == '周一':
        add_item('热身', '热身', row_rep='时间/次数', rest_key=None)
        add_item('主训练', '主训练')
        add_item('腹肌', '腹肌')
        add_item('拉伸', '拉伸', row_rep='时间', rest_key=None)
    elif weekday == '周二':
        add_item('热身', '热身', row_rep='时间/次数', rest_key=None)
        add_item('主训练', '主训练')
        add_item('腹肌', '腹肌')
        add_item('拉伸', '拉伸', row_rep='时间', rest_key=None)
    elif weekday == '周三':
        add_item('有氧运动', '有氧运动（30分钟，优先户外）', row_name='选项', row_rep='时长', rest_key=None)
        add_item('泡沫轴放松', '泡沫轴放松（6分钟)', row_rep='时间', rest_key=None, row_name='部位')
        add_item('静态拉伸', '静态拉伸(10分钟)', row_rep='时间', rest_key=None)
        add_item('呼吸放松', '呼吸放松(3分钟)', row_rep='时间', rest_key=None)
    elif weekday == '周四':
        add_item('热身', '热身', row_rep='时间/次数', rest_key=None)
        add_item('主训练', '主训练')
        add_item('腹肌', '腹肌')
        add_item('拉伸', '拉伸', row_rep='时间', rest_key=None)
    elif weekday == '周五':
        add_item('热身', '热身', row_rep='时间/次数', rest_key=None)
        add_item('主训练', '主训练')
        add_item('腹肌专项', '腹肌专项(15分钟)')
        add_item('拉伸', '拉伸', row_rep='时间', rest_key=None)
    elif weekday == '周六':
        add_item('热身', '热身', row_rep='时间/次数', rest_key=None)
        add_item('有氧运动', '有氧运动（30分钟，优先户外）', row_name='选项', row_rep='时长', rest_key=None)
        add_item('泡沫轴放松', '泡沫轴放松（6分钟)', row_rep='时间', rest_key=None, row_name='部位')
        stretch_steps = []
        stretch_section = sections.get('静态拉伸(10分钟)')
        if stretch_section and stretch_section.get('table_rows'):
            stretch_steps.extend([f"{row['动作']} {row['时间']}" for row in stretch_section['table_rows'] if row.get('动作')])
        breath_section = sections.get('呼吸放松(5分钟)')
        if breath_section and breath_section.get('table_rows'):
            stretch_steps.extend([f"{row['动作']} {row['时间']}" for row in breath_section['table_rows'] if row.get('动作')])
        if stretch_steps:
            items.append({'title': '静态拉伸 + 呼吸', 'time': TIME_MAP['周六']['静态拉伸 + 呼吸'], 'steps': stretch_steps})
    elif weekday == '周日':
        add_item('可选有氧', '可选有氧运动（20-30分钟）', detail_mode=True)
        add_item('泡沫轴放松', '泡沫轴放松(6分钟)', row_rep='时间', rest_key=None, row_name='部位')
        add_item('静态拉伸', '静态拉伸(15分钟)', row_rep='时间', rest_key=None)
        add_item('呼吸放松', '呼吸放松(8分钟)', row_rep='时间', rest_key=None)

    return {
        'badge': meta['badge'],
        'title': meta['title'],
        'subtitle': meta['subtitle'],
        'items': items,
        'sourceNote': str(SOURCE),
    }


def split_weekday_blocks(text: str) -> dict[str, str]:
    pattern = re.compile(r'^##\s*(.+)$', re.MULTILINE)
    matches = list(pattern.finditer(text))
    blocks = {}
    for idx, match in enumerate(matches):
        header = match.group(1).strip()
        weekday = TRAINING_HEADERS.get(header)
        if not weekday:
            continue
        start = match.start()
        next_start = len(text)
        for later in matches[idx + 1:]:
            later_header = later.group(1).strip()
            if later_header in TRAINING_HEADERS or later_header.startswith('腹肌训练总览') or later_header.startswith('记录模板'):
                next_start = later.start()
                break
        blocks[weekday] = text[start:next_start]
    return blocks


def main() -> None:
    text = SOURCE.read_text()
    blocks = split_weekday_blocks(text)
    missing = [day for day in WEEKDAY_META if day not in blocks]
    if missing:
        raise SystemExit(f'Missing weekday blocks in Obsidian note: {missing}')
    payload = {day: build_weekday_plan(day, blocks[day]) for day in WEEKDAY_META}
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    print(f'Wrote {OUTPUT}')


if __name__ == '__main__':
    main()
