import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function parseBirthdayScheduleDate(dateValue, timezoneName = "Asia/Kolkata") {
  if (!dateValue) {
    return null;
  }

  if (DATE_ONLY_PATTERN.test(dateValue)) {
    return dayjs
      .tz(dateValue, "YYYY-MM-DD", timezoneName)
      .startOf("day")
      .toDate();
  }

  if (DATE_TIME_PATTERN.test(dateValue)) {
    return dayjs
      .tz(dateValue, "YYYY-MM-DDTHH:mm", timezoneName)
      .toDate();
  }

  return new Date(dateValue);
}

export function parseCouponExpiryDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  if (DATE_ONLY_PATTERN.test(dateValue)) {
    return dayjs(dateValue, "YYYY-MM-DD").endOf("day").toDate();
  }

  return new Date(dateValue);
}
