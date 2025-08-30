// src/lib/dateUtils.ts

/**
 * yyyyMMddhhmm形式の文字列を各部分に分解
 * @param dateString - yyyyMMddhhmm形式の文字列
 * @returns 年月日時分のオブジェクト
 */
export function parseCompactDate(dateString: string | undefined): {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
} {
  if (!dateString || dateString.length !== 12) {
    return {
      year: '',
      month: '',
      day: '',
      hour: '',
      minute: ''
    };
  }

  return {
    year: dateString.substring(0, 4),
    month: dateString.substring(4, 6),
    day: dateString.substring(6, 8),
    hour: dateString.substring(8, 10),
    minute: dateString.substring(10, 12)
  };
}

/**
 * 各部分からyyyyMMddhhmm形式の文字列を構築
 * @param parts - 年月日時分のオブジェクト
 * @returns yyyyMMddhhmm形式の文字列、または空文字列（無効な場合）
 */
export function buildCompactDate(parts: {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}): string {
  const { year, month, day, hour, minute } = parts;

  // 全て入力されているかチェック
  if (!year || !month || !day || !hour || !minute) {
    return '';
  }

  // 数値として有効かチェック
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  const hourNum = parseInt(hour);
  const minuteNum = parseInt(minute);

  if (
    isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum) || 
    isNaN(hourNum) || isNaN(minuteNum) ||
    monthNum < 1 || monthNum > 12 ||
    dayNum < 1 || dayNum > 31 ||
    hourNum < 0 || hourNum > 23 ||
    minuteNum < 0 || minuteNum > 59
  ) {
    return '';
  }

  return `${year}${month}${day}${hour}${minute}`;
}

/**
 * 各部分が有効かどうかをチェック
 * @param parts - 年月日時分のオブジェクト
 * @returns 有効な場合true、無効な場合false
 */
export function isValidDateParts(parts: {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}): boolean {
  return buildCompactDate(parts) !== '';
}

/**
 * yyyyMMddhhmm形式の文字列をyyyy年MM月dd日 hh:mm形式に変換
 * @param dateString - yyyyMMddhhmm形式の文字列
 * @returns yyyy年MM月dd日 hh:mm形式の文字列、または空文字列
 */
export function formatDateFromCompact(dateString: string | undefined): string {
  if (!dateString || dateString.length !== 12) {
    return '';
  }

  try {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);

    // 数値として有効かチェック
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);

    if (
      isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum) || 
      isNaN(hourNum) || isNaN(minuteNum) ||
      monthNum < 1 || monthNum > 12 ||
      dayNum < 1 || dayNum > 31 ||
      hourNum < 0 || hourNum > 23 ||
      minuteNum < 0 || minuteNum > 59
    ) {
      return '';
    }

    return `${year}年${month}月${day}日 ${hour}:${minute}`;
  } catch {
    return '';
  }
}

/**
 * yyyy年MM月dd日 hh:mm形式の文字列をyyyyMMddhhmm形式に変換
 * @param formattedDate - yyyy年MM月dd日 hh:mm形式の文字列
 * @returns yyyyMMddhhmm形式の文字列、または空文字列（エラーの場合）
 */
export function formatDateToCompact(formattedDate: string): string {
  if (!formattedDate || formattedDate.trim() === '') {
    return '';
  }

  try {
    // yyyy年MM月dd日 hh:mm の正規表現
    const regex = /^(\d{4})年(\d{2})月(\d{2})日 (\d{2}):(\d{2})$/;
    const match = formattedDate.match(regex);

    if (!match) {
      return '';
    }

    const year = match[1];
    const month = match[2];
    const day = match[3];
    const hour = match[4];
    const minute = match[5];

    // 数値として有効かチェック
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);

    if (
      isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum) || 
      isNaN(hourNum) || isNaN(minuteNum) ||
      monthNum < 1 || monthNum > 12 ||
      dayNum < 1 || dayNum > 31 ||
      hourNum < 0 || hourNum > 23 ||
      minuteNum < 0 || minuteNum > 59
    ) {
      return '';
    }

    return `${year}${month}${day}${hour}${minute}`;
  } catch {
    return '';
  }
}

/**
 * yyyy年MM月dd日 hh:mm形式の文字列が有効かどうかをチェック
 * @param formattedDate - チェックする文字列
 * @returns 有効な場合true、無効な場合false
 */
export function isValidFormattedDate(formattedDate: string): boolean {
  if (!formattedDate || formattedDate.trim() === '') {
    return false;
  }
  return formatDateToCompact(formattedDate) !== '';
}