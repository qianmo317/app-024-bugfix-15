// 设置保存测试：分区保存互不影响；奖项预设去空白/去重
import { describe, it, expect } from 'vitest';
import { store, DEFAULT_SETTINGS } from '../src/lib/store';

describe('saveSettings', () => {
  it('保存打印参数不冲掉活动信息与奖项预设', async () => {
    await store.saveSettings({
      event: { ...DEFAULT_SETTINGS.event, title: '社区灯会', host: '××社区工会' },
      prizes: ['参与奖', '大奖'],
    });
    await store.saveSettings({ print: { ...DEFAULT_SETTINGS.print, perPage: 9 } });
    const s = store.getState().settings;
    expect(s.print.perPage).toBe(9);
    expect(s.event.title).toBe('社区灯会');
    expect(s.event.host).toBe('××社区工会');
    expect(s.prizes).toEqual(['参与奖', '大奖']);
  });

  it('保存活动信息不冲掉打印参数与奖项预设', async () => {
    await store.saveSettings({
      print: { ...DEFAULT_SETTINGS.print, perPage: 12, hostLine: '工会宣' },
      prizes: ['幸运奖'],
    });
    await store.saveSettings({ event: { ...DEFAULT_SETTINGS.event, title: '元宵灯会' } });
    const s = store.getState().settings;
    expect(s.event.title).toBe('元宵灯会');
    expect(s.print.perPage).toBe(12);
    expect(s.print.hostLine).toBe('工会宣');
    expect(s.prizes).toEqual(['幸运奖']);
  });

  it('保存奖项不冲掉活动信息与打印参数', async () => {
    await store.saveSettings({
      event: { ...DEFAULT_SETTINGS.event, title: '灯谜会' },
      print: { ...DEFAULT_SETTINGS.print, perPage: 4 },
    });
    await store.saveSettings({ prizes: ['一等奖'] });
    const s = store.getState().settings;
    expect(s.prizes).toEqual(['一等奖']);
    expect(s.event.title).toBe('灯谜会');
    expect(s.print.perPage).toBe(4);
  });

  it('奖项预设：去首尾空白、丢弃空项、按名字去重', async () => {
    await store.saveSettings({ prizes: ['参与奖', ' 参与奖 ', '', '   ', '大奖', '大奖'] });
    expect(store.getState().settings.prizes).toEqual(['参与奖', '大奖']);
  });

  it('未给出的字段保留原值而非回到默认', async () => {
    await store.saveSettings({
      event: { ...DEFAULT_SETTINGS.event, title: '保留我', host: '某单位' },
      print: { ...DEFAULT_SETTINGS.print, cardWmm: 80 },
      prizes: ['特等奖'],
    });
    await store.saveSettings({});
    const s = store.getState().settings;
    expect(s.event.title).toBe('保留我');
    expect(s.event.host).toBe('某单位');
    expect(s.print.cardWmm).toBe(80);
    expect(s.prizes).toEqual(['特等奖']);
  });
});
