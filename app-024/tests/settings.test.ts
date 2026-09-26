// 设置持久化回归：分段保存互不覆盖、奖项清洗（去空白/去重/去空）
import { describe, it, expect } from 'vitest';
import { store, DEFAULT_SETTINGS, normalizePrizes } from '../src/lib/store';
import { effectiveHostLine } from '../src/lib/print';

describe('normalizePrizes', () => {
  it('去掉首尾空白', () => {
    expect(normalizePrizes([' 一等奖 ', '二等奖'])).toEqual(['一等奖', '二等奖']);
  });
  it('丢弃空串与纯空白', () => {
    expect(normalizePrizes(['', '   ', '参与奖'])).toEqual(['参与奖']);
  });
  it('去重且保持原顺序', () => {
    expect(normalizePrizes(['一等奖', '二等奖', '一等奖', ' 二等奖 '])).toEqual(['一等奖', '二等奖']);
  });
});

describe('saveSettings 分段合并', () => {
  it('保存打印参数不冲掉活动信息与奖项', async () => {
    await store.saveSettings({
      event: { ...DEFAULT_SETTINGS.event, title: '社区灯会', host: '某某社区工会' },
      prizes: ['参与奖', '特等奖'],
    });
    await store.saveSettings({ print: { ...DEFAULT_SETTINGS.print, perPage: 12 } });
    const s = store.getState().settings;
    expect(s.print.perPage).toBe(12);
    expect(s.event.title).toBe('社区灯会');
    expect(s.prizes).toEqual(['参与奖', '特等奖']);
  });

  it('保存活动信息不冲掉打印参数与奖项', async () => {
    await store.saveSettings({ event: { ...DEFAULT_SETTINGS.event, title: '改名灯会' } });
    const s = store.getState().settings;
    expect(s.event.title).toBe('改名灯会');
    expect(s.print.perPage).toBe(12); // 沿用上一用例保存的值
    expect(s.prizes).toEqual(['参与奖', '特等奖']);
  });

  it('保存奖项不冲掉活动信息与打印参数，且奖项被清洗', async () => {
    await store.saveSettings({ prizes: [' 幸运奖 ', '幸运奖', '', '特等奖'] });
    const s = store.getState().settings;
    expect(s.prizes).toEqual(['幸运奖', '特等奖']);
    expect(s.event.title).toBe('改名灯会');
    expect(s.print.perPage).toBe(12);
  });
});

describe('effectiveHostLine 落款回退', () => {
  it('打印默认落款优先', () => {
    expect(effectiveHostLine('自定义落款', '主办方')).toBe('自定义落款');
  });
  it('落款留空时回退到主办方', () => {
    expect(effectiveHostLine('', '某某社区工会')).toBe('某某社区工会');
    expect(effectiveHostLine('   ', '某某社区工会')).toBe('某某社区工会');
  });
  it('两者皆空则为空', () => {
    expect(effectiveHostLine('', '')).toBe('');
  });
});
