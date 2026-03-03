import { useState, useMemo, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import './Calendar.scss';

interface CalendarProps {
  visible: boolean;
  checkInDate: string;
  checkOutDate: string;
  onConfirm: (checkIn: string, checkOut: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatDateCN(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: string, b: string): boolean {
  return a === b;
}

function isInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr > start && dateStr < end;
}

function Calendar({ visible, checkInDate, checkOutDate, onConfirm, onClose }: CalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => toDateStr(today), [today]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = checkInDate ? new Date(checkInDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [tempCheckIn, setTempCheckIn] = useState<string | null>(checkInDate || null);
  const [tempCheckOut, setTempCheckOut] = useState<string | null>(checkOutDate || null);
  const [selectStep, setSelectStep] = useState<'checkIn' | 'checkOut'>('checkIn');

  // 同步外部数据
  useMemo(() => {
    if (visible) {
      setTempCheckIn(checkInDate || null);
      setTempCheckOut(checkOutDate || null);
      setSelectStep('checkIn');
      if (checkInDate) {
        const d = new Date(checkInDate);
        setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [visible, checkInDate, checkOutDate]);

  // 生成日历网格数据
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ date: string; day: number; disabled: boolean } | null> = [];

    // 前置空白
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 填充日期
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(new Date(year, month, d));
      days.push({
        date: dateStr,
        day: d,
        disabled: dateStr < todayStr
      });
    }

    return days;
  }, [currentMonth, todayStr]);

  const monthLabel = useMemo(() => {
    return `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;
  }, [currentMonth]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      // 不允许切换到当前月之前
      const now = new Date();
      if (
        d.getFullYear() < now.getFullYear() ||
        (d.getFullYear() === now.getFullYear() && d.getMonth() < now.getMonth())
      ) {
        return prev;
      }
      return d;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const handleDateClick = useCallback(
    (dateStr: string, disabled: boolean) => {
      if (disabled) return;

      if (selectStep === 'checkIn') {
        setTempCheckIn(dateStr);
        setTempCheckOut(null);
        setSelectStep('checkOut');
      } else {
        if (dateStr <= (tempCheckIn || '')) {
          // 如果选了比入住日更早的日期，重置为新的入住日
          setTempCheckIn(dateStr);
          setTempCheckOut(null);
          setSelectStep('checkOut');
        } else {
          setTempCheckOut(dateStr);
          setSelectStep('checkIn');
        }
      }
    },
    [selectStep, tempCheckIn]
  );

  const handleConfirm = useCallback(() => {
    if (tempCheckIn && tempCheckOut) {
      onConfirm(tempCheckIn, tempCheckOut);
    }
  }, [tempCheckIn, tempCheckOut, onConfirm]);

  const nights = useMemo(() => {
    if (!tempCheckIn || !tempCheckOut) return 0;
    const diff = new Date(tempCheckOut).getTime() - new Date(tempCheckIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [tempCheckIn, tempCheckOut]);

  // 判断是否可切换上一月
  const canGoPrev = useMemo(() => {
    const now = new Date();
    return (
      currentMonth.getFullYear() > now.getFullYear() ||
      (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() > now.getMonth())
    );
  }, [currentMonth]);

  if (!visible) return null;

  return (
    <View className="calendar">
      <View className="calendar__mask" onClick={onClose} />
      <View className="calendar__sheet">
        {/* 标题栏 */}
        <View className="calendar__header">
          <Text className="calendar__title">选择入住-离店日期</Text>
          <Text className="calendar__close" onClick={onClose}>
            ✕
          </Text>
        </View>

        {/* 提示 */}
        <View className="calendar__hint">
          <Text className="calendar__hint-text">
            {selectStep === 'checkIn' ? '请选择入住日期' : '请选择离店日期'}
          </Text>
        </View>

        {/* 月份切换 */}
        <View className="calendar__month-nav">
          <Text
            className={`calendar__nav-btn ${!canGoPrev ? 'calendar__nav-btn--disabled' : ''}`}
            onClick={handlePrevMonth}
          >
            ◀
          </Text>
          <Text className="calendar__month-label">{monthLabel}</Text>
          <Text className="calendar__nav-btn" onClick={handleNextMonth}>
            ▶
          </Text>
        </View>

        {/* 星期表头 */}
        <View className="calendar__weekdays">
          {WEEKDAYS.map((w) => (
            <Text key={w} className="calendar__weekday">
              {w}
            </Text>
          ))}
        </View>

        {/* 日期网格 */}
        <View className="calendar__grid">
          {calendarDays.map((item, idx) => {
            if (!item) {
              return <View key={`empty-${idx}`} className="calendar__day calendar__day--empty" />;
            }

            const isCheckIn = tempCheckIn ? isSameDay(item.date, tempCheckIn) : false;
            const isCheckOut = tempCheckOut ? isSameDay(item.date, tempCheckOut) : false;
            const inRange =
              tempCheckIn && tempCheckOut ? isInRange(item.date, tempCheckIn, tempCheckOut) : false;
            const isToday = isSameDay(item.date, todayStr);

            let cls = 'calendar__day';
            if (item.disabled) cls += ' calendar__day--disabled';
            if (isCheckIn) cls += ' calendar__day--check-in';
            if (isCheckOut) cls += ' calendar__day--check-out';
            if (inRange) cls += ' calendar__day--in-range';

            return (
              <View
                key={item.date}
                className={cls}
                onClick={() => handleDateClick(item.date, item.disabled)}
              >
                <Text className="calendar__day-num">{item.day}</Text>
                {isCheckIn && <Text className="calendar__day-label">入住</Text>}
                {isCheckOut && <Text className="calendar__day-label">离店</Text>}
                {isToday && !isCheckIn && !isCheckOut && (
                  <Text className="calendar__day-label calendar__day-label--today">今天</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* 底部信息 */}
        <View className="calendar__footer">
          <View className="calendar__footer-info">
            {tempCheckIn && (
              <Text className="calendar__footer-date">入住: {formatDateCN(tempCheckIn)}</Text>
            )}
            {tempCheckOut && (
              <Text className="calendar__footer-date">
                离店: {formatDateCN(tempCheckOut)} 共{nights}晚
              </Text>
            )}
          </View>
          <View
            className={`calendar__footer-btn ${tempCheckIn && tempCheckOut ? '' : 'calendar__footer-btn--disabled'}`}
            onClick={handleConfirm}
          >
            <Text className="calendar__footer-btn-text">确 定</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default Calendar;
