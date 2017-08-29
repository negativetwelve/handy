// Libraries
import _ from 'jolt-lodash';
import invariant from 'invariant';
import moment from 'moment';


const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const TIME = ['second', 'minute', 'day', 'week', 'month', 'year'];
const ABBREVIATED_TIME = ['s', 'm', 'h', 'd', 'w', 'mo', 'y'];

const MILLISECOND = 1;
const SECOND = MILLISECOND * 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

/**
 * Handy wrapper around the built-in Date object. This provides a number
 * of helpers used to construct dates and times that we display on the clients.
 */
class Datetime {

  static DAYS = DAYS;
  static MONTHS = MONTHS;
  static TIME = TIME;
  static ABBREVIATED_TIME = ABBREVIATED_TIME;

  static MILLISECOND = MILLISECOND;
  static SECOND = SECOND;
  static MINUTE = MINUTE;
  static HOUR = HOUR;
  static DAY = DAY;
  static WEEK = WEEK;

  static _moment = moment;

  /**
   * Selects the correct moment.js constructor to use based on options.
   */
  static moment({utc}) {
    return utc ? moment.utc : moment;
  }

  static createMoment({utc, string}) {
    const create = this.moment({utc});

    if (string instanceof this) {
      // String is a Datetime object, we use the backing moment to construct
      // the new date.
      return create(string.moment);
    } else if (moment.isMoment(string) || _.isDate(string)) {
      // Create the moment from another moment object or a native JS date
      // object.
      return create(string);
    } else if (_.isString(string)) {
      // Parses the string as a moment ISO8601 string.
      return create(string, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
    } else if (_.isInteger(string)) {
      return create(string);
    } else {
      // Represents the null time which is a blank Datetime object.
      return moment.utc(0);
    }
  }

  /**
   * If the string is a datetime, it just returns it, otherwise it creates
   * a new instance with the specified options.
   */
  static create(string, options) {
    return this.isDatetime(string) ? string : new this(string, options);
  }

  // --------------------------------------------------
  // Initialize
  // --------------------------------------------------

  /**
   * We use a built-in date object as a backer.
   */
  constructor(string, {utc = false} = {}) {
    this.string = string;
    this.moment = Datetime.createMoment({utc, string});
  }

  /**
   * The empty Datetime, represented by `new Datetime()` will return
   * true for this method, false otherwise.
   */
  get isEmpty() {
    return !_.exists(this.string);
  }

  /**
   * Returns a new Datetime object in UTC time.
   */
  static utc(string) {
    return new this(string, {utc: true});
  }

  /**
   * Creates a Datetime instance from a unix integer.
   */
  static fromInteger(integer, {utc = false} = {}) {
    return new this(integer, {utc});
  }

  /**
   * Creates a Datetime object from the built-in javascript Date class.
   */
  static fromDate(date) {
    return new this(date).midnight;
  }

  /**
   * Alias for `fromDate` that uses a string format: '2016-12-05'.
   */
  static forDate(date) {
    return this.fromDate(date);
  }

  /**
   * Creates a Datetime representing today at a specific hour.
   */
  static forHour(hour) {
    return this.today.addHours(hour);
  }

  static fromHour(hour) {
    if (hour <= 0 || hour >= 24) {
      return new this();
    } else {
      return this.forHour(hour);
    }
  }

  /**
   * Creates a Datetime representing today at a specific hour and minute.
   */
  static forTime(hour, minutes = 0) {
    return this.forHour(hour).addMinutes(minutes);
  }

  /**
   * Returns a new Datetime object in local time representing now.
   */
  static get now() {
    return new this(new Date());
  }

  static get beginningOfWeek() {
    return this.today.beginningOfWeek;
  }

  static get yesterday() {
    return this.today.previousDay;
  }

  static get today() {
    return this.now.utc.midnight;
  }

  static get tomorrow() {
    return this.today.nextDay;
  }

  static get dayAfterTomorrow() {
    return this.tomorrow.nextDay;
  }

  static get endOfWeek() {
    return this.today.endOfWeek;
  }

  static get week() {
    return this.today.daysForWeek;
  }

  static get month() {
    return this.today.daysForMonth;
  }

  // --------------------------------------------------
  // String Parsing
  // --------------------------------------------------
  static sanitize(string) {
    // TODO(mark): Add more rules.
    string = this.sanitizeColons(string);

    return string;
  }

  static sanitizeColons(string) {
    switch (_.countCharacters(string, ':')) {
      case 0:
        // If it doesn't have any colons, just continue!
        return string;
      case 1: // eslint-disable-line no-case-declarations
        const tokens = string.split(':');
        const [hours, rest] = tokens;
        const [minutes, meridiem] = rest.match(/.{1,2}/g) || [];

        if (!this.isValidHours(hours)) {
          return;
        } else if (!this.isValidMinutes(minutes)) {
          return;
        } else if (_.exists(meridiem) && !this.isValidMeridian(meridiem)) {
          return;
        }

        // Make sure the hours has 2 digits by padding it with 0s.
        const paddedHours = _.padStart(hours, 2, '0');

        return _.join([paddedHours, rest], '');
      default:
        // Anything with more than 1 colon can just exit. We can't do anything
        // with these.
        return;
    }
  }

  // --------------------------------------------------
  // Time Parsing
  // --------------------------------------------------

  /**
   * Converts various time strings to standard datetime objects.
   * Currently includes:
   *
   *   1. 08:00PM -> 8:00pm
   *   2. 2000 -> 8:00pm
   *   3. 8 -> 8:00am
   *   4. 20 -> 8:00pm
   *   5. 8am -> 8:00am
   */
  static fromTimeString(string) {
    // Remove all values that we can't parse.
    string = this.sanitize(string);

    if (_.isEmpty(string)) {
      // If after sanitizing, there's nothing left, we can exit with the
      // empty Datetime.
      return new this();
    } else if (this.isMilitaryTime(string)) {
      // Case #2
      return this.fromMilitaryTime(string);
    } else if (this.isValidNumber(string)) {
      // Case #3, #4
      return this.fromNumbers(string);
    } else if (this.endsWithMeridian(string)) {
      // Case #1, #5
      return this.fromNumbersAndMeridian(string);
    } else {
      return new this();
    }
  }

  static fromNumbers(string) {
    switch (_.toString(string).length) {
      case 4:
        // ex. 0800 or 2000
        return this.fromMilitaryTime(string);
      case 3:
        // ex. 800, 100, these are ambiguous and require more parsing.
        return this.fromAmbiguousTime(string);
      case 2:
      case 1:
        // These are assumed to just be the hour, if it's larger than 24,
        // it returns the empty datetime.
        return this.fromHour(_.toNumber(string));
      default:
        // Otherwise, we just return the empty datetime.
        return new this();
    }
  }

  /**
   * Parses strings with numbers and a meridiem. Examples include:
   *
   *   1. 8am
   *   2. 12pm
   */
  static fromNumbersAndMeridian(string) {
    const meridiem = this.parseMeridian(string);
    const datetime = this.fromNumbers(string.replace(meridiem, ''));
    const isPM = this.isPMMeridian(meridiem);

    if (datetime.isEmpty) {
      return new this();
    } else if (datetime.hour === 12) {
      // If it's intended to be noon, don't adjust the hour by the meridiem.
      // If it's intended to be midnight, subtract 12 hours to make it midnight.
      return datetime.addHours(isPM ? 0 : -12);
    } else if (isPM && datetime.isPM) {
      // If we have a PM time and we're trying to adjust it to PM, that's an
      // error. The only valid case is 12pm (noon)!
      return new this();
    } else {
      return datetime.addMeridian(meridiem);
    }
  }

  /**
   * Creates a Datetime object for the current day at a specific time
   * (in military time).
   */
  static fromMilitaryTime(string) {
    const [hours, minutes] = string.match(/.{1,2}/g);

    return this.forTime(hours, minutes);
  }

  /**
   * TODO(mark): Needs a better name. This is for parsing 3-digit times
   * which are ambiguous if they are 1 digit for hours or 2.
   */
  static fromAmbiguousTime(string) {
    // TODO(mark): Might change depending on how we use this.
    if (string.length !== 3) {
      return new this();
    }

    const tokens = _.split(string, '');
    const [first, second, third] = _.map(tokens, _.toNumber);

    if (first === 0 || first === 1) {
      // These are the especially ambiguous characters. If this happens,
      // we should just bail and return the empty datetime. They're
      // ambiguous because we don't know if the next digit should be part
      // of the `hours` field or the `minutes` field.
      return new this();
    }

    // Assuming the first character is the hour, we can treat the rest as
    // the minutes.
    return this.forTime(first, second * 10 + third);
  }

  // --------------------------------------------------
  // Meridian Parsing
  // --------------------------------------------------
  static isAMMeridian(string) {
    return _.includes(['am', 'a'], _.toLowerCase(string));
  }

  static isPMMeridian(string) {
    return _.includes(['pm', 'p'], _.toLowerCase(string));
  }

  static isValidMeridian(string) {
    return this.isAMMeridian(string) || this.isPMMeridian(string);
  }

  static endsWithMeridian(string) {
    if (!_.isString(string)) {
      return false;
    }

    return this.isValidMeridian(this.parseMeridian(string));
  }

  static parseMeridian(string) {
    return _.first(string.match(/[ampAMP]+$/g));
  }

  // --------------------------------------------------
  // Validations
  // --------------------------------------------------
  static isNumericString(string) {
    return _.isString(string) && _.isNumeric(string);
  }

  static isValidNumber(string) {
    return (
      this.isNumericString(string) &&
      _.size(string) > 0 &&
      _.size(string) <= 4
    );
  }

  static isMilitaryTime(string) {
    return (
      this.isNumericString(string) &&
      _.size(string) === 4
    );
  }

  static isValidHours(string) {
    return (
      this.isNumericString(string) &&
      _.size(string) > 0 &&
      _.size(string) <= 2
    );
  }

  static isValidMinutes(string) {
    return (
      this.isNumericString(string) &&
      _.size(string) === 2
    );
  }

  // --------------------------------------------------
  // Base
  // --------------------------------------------------

  /**
   * We need to define this in order to use <, >, == operators.
   */
  valueOf() {
    return this.millisecondsSinceEpoch;
  }

  /**
   * Returns whether or not two datetimes or date objects are equal.
   */
  isEqual(datetime) {
    return _.exists(datetime) && this.valueOf() === datetime.valueOf();
  }

  get unixTimestamp() {
    return this.millisecondsSinceEpoch;
  }

  get unixTimestampInSeconds() {
    return this.millisecondsSinceEpoch / 1000;
  }

  static isDatetime(datetime) {
    return datetime instanceof this;
  }

  /**
   * TODO(eugene): Eventually want to check that string is formatted like:
   *
   *   YYYY-MM-DDTHH:mm:ss.SSSZ
   *
   * This should be used in the string check in Datetime.createMoment().
   */
  static isValidString(string) {
    return _.isString(string) && !_.isEmpty(string);
  }

  static isValidDatetime(datetime) {
    return Datetime.isDatetime(datetime) && !datetime.isEmpty;
  }

  // --------------------------------------------------
  // Range
  // --------------------------------------------------
  static range(start, end, step = Datetime.DAY) {
    const days = [];

    while (start < end) {
      days.push(new Datetime(start));
      start = start.addTime(step);
    }

    return days;
  }

  get daysForWeek() {
    return Datetime.range(this.beginningOfWeek, this.endOfWeek);
  }

  get daysForMonth() {
    return Datetime.range(this.firstOfMonth, this.lastOfMonth);
  }

  get daysForRoundedMonth() {
    return Datetime.range(
      this.firstOfMonth.beginningOfWeek,
      this.lastOfMonth.endOfWeek,
    );
  }

  static timeRange(startHour, startMinute, endHour, endMinute, increment) {
    const options = [];
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour ||
          (currentHour === endHour && currentMinute < endMinute)) {
      options.push(this.forTime(currentHour, currentMinute));

      currentMinute += increment;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }

    return options;
  }

  static timeRangeWithExtraTimes(
    startHour,
    startMinute,
    endHour,
    endMinute,
    increment,
    datetimes,
  ) {
    const range = this.timeRange(
      startHour,
      startMinute,
      endHour,
      endMinute,
      increment,
    );

    const all = _.concat(range, datetimes);

    return Datetime.sortAscending(all);
  }

  // --------------------------------------------------
  // Sort
  // --------------------------------------------------
  static sortAscending(datetimes) {
    return _.sortBy(datetimes, [datetime => datetime.valueOf()]);
  }

  // --------------------------------------------------
  // Comparisons
  // --------------------------------------------------
  get isUTC() {
    return this.moment.isUTC();
  }

  /**
   * Returns true if this datetime occurs between the start and end times.
   * We use <= for start because midnight should match the current day.
   * We use < for the end because 11:59pm should match, but midnight should
   * not.
   */
  isBetween(start, end) {
    return this.isOnOrAfter(start) && this.isBefore(end);
  }

  isOnOrAfter(date) {
    return this.isEqual(date) || this.isAfter(date);
  }

  isAfter(date) {
    return _.exists(date) && this.valueOf() > date.valueOf();
  }

  isOnOrBefore(date) {
    return this.isEqual(date) || this.isBefore(date);
  }

  isBefore(date) {
    return _.exists(date) && this.valueOf() < date.valueOf();
  }

  isSameDay(date) {
    return date.isBetween(this.midnight, this.nextDay.midnight);
  }

  get isAM() {
    return this.hour < 12;
  }

  get isPM() {
    return this.hour >= 12;
  }

  get isNoon() {
    return this.hour === 12 && this.minutes === 0;
  }

  get isMidnight() {
    return this.hour === 0 && this.minutes === 0;
  }

  get isYesterday() {
    return this.isBetween(Datetime.yesterday, Datetime.today);
  }

  get isToday() {
    return this.isBetween(Datetime.today, Datetime.tomorrow);
  }

  get isTomorrow() {
    return this.isBetween(Datetime.tomorrow, Datetime.dayAfterTomorrow);
  }

  // --------------------------------------------------
  // Relative Time
  // --------------------------------------------------

  /**
   * Converts a Datetime to UTC WITHOUT adjusting the time.
   * 5pm in PST -> 5pm UTC
   */
  get utc() {
    return this.toUTC().addMinutes(Datetime.now.timezoneOffsetInMinutes);
  }

  /**
   * Converts a Datetime to UTC and adjusts the actual time.
   *
   * Ex. 5pm in PST + timezone = 12 or 1am (depending on the time of the year
   * and DST).
   */
  toUTC() {
    return this.clone((clone) => clone.moment.utc());
  }

  get midnight() {
    return this.startOf('day');
  }

  get beginningOfWeek() {
    return this.startOf('week');
  }

  get endOfWeek() {
    return this.endOf('week');
  }

  get firstOfMonth() {
    return this.setDayOfMonth(1);
  }

  get lastOfMonth() {
    return this.setDayOfMonth(this.daysInMonth);
  }

  get nextDay() {
    return this.addDays(1);
  }

  get previousDay() {
    return this.addDays(-1);
  }

  get nextMonth() {
    return this.addMonths(1);
  }

  get previousMonth() {
    return this.addMonths(-1);
  }

  startOf(timeframe) {
    return this.clone((clone) => clone.moment.startOf(timeframe));
  }

  endOf(timeframe) {
    return this.clone((clone) => clone.moment.endOf(timeframe));
  }

  // --------------------------------------------------
  // Setters
  // --------------------------------------------------

  /**
   * Clones a Datetime object so we can mutate the backing date.
   */
  clone(callback = _.noop) {
    return _.tap(new Datetime(this.moment), callback);
  }

  /**
   * Grabs the hour and minutes from the provided datetime and sets the time.
   */
  setTime(datetime) {
    return this.setTimeValues({
      hour: datetime.hour,
      minutes: datetime.minutes,
    });
  }

  /**
   * Sets the time based on the provided hours and minutes values.
   */
  setTimeValues({hour = 0, minutes = 0}) {
    return this.midnight.addHours(hour).addMinutes(minutes);
  }

  // Sets the day of the month between 1-31.
  setDayOfMonth(day) {
    return this.clone((clone) => clone.moment.date(day));
  }

  // Sets the month of the year between 0-11.
  setMonth(month) {
    return this.clone((clone) => clone.moment.month(month));
  }

  /**
   * Modifies the time by `milliseconds`.
   */
  addTime(milliseconds) {
    return this.clone((clone) => clone.moment.millisecond(milliseconds));
  }

  addSeconds(seconds) {
    return this.addTime(seconds * 1000);
  }

  addMinutes(minutes) {
    return this.addSeconds(minutes * 60);
  }

  /**
   * Adjusts the time by `hour` hours. If you supply a negative number, it
   * will move back in time.
   */
  addHours(hours) {
    return this.addMinutes(hours * 60);
  }

  /**
   * Expects a valid meridiem (upper / lower is okay).
   */
  addMeridian(meridiem) {
    if (Datetime.isPMMeridian(meridiem)) {
      return this.addHours(12);
    } else {
      return this.addHours(0);
    }
  }

  addDays(days) {
    return this.addHours(days * 24);
  }

  addMonths(months) {
    return this.setMonth(this.months + months);
  }

  // --------------------------------------------------
  // Round
  // --------------------------------------------------
  roundValue({value, interval}) {
    return Math.round(value / interval) * interval;
  }

  roundMinutes({interval}) {
    return this.roundValue({value: this.minutes, interval});
  }

  roundHours({interval}) {
    return this.roundValue({value: this.hour, interval});
  }

  // --------------------------------------------------
  // Timezones
  // --------------------------------------------------
  get utcOffset() {
    return this.moment.utcOffset();
  }

  get timezoneOffsetInHours() {
    return this.timezoneOffsetInMinutes / 60;
  }

  get timezoneOffsetInMinutes() {
    return this.utcOffset;
  }

  get timezoneOffsetInSeconds() {
    return this.timezoneOffsetInMinutes * 60;
  }

  get timezoneOffsetInMilliseconds() {
    return this.timezoneOffsetInSeconds * 1000;
  }

  // --------------------------------------------------
  // Representation
  // --------------------------------------------------
  toMoment() {
    return this.moment;
  }

  toDate() {
    return this.isUTC ? this.toUTCAdjustedDate() : this.toLocalDate();
  }

  /**
   * Converts to a JS Date object in the local timezone.
   */
  toLocalDate() {
    return this.toMoment().toDate();
  }

  /**
   * Takes a UTC datetime object, adjusts by the timezone offset it WOULD
   * be converted to, then takes the resulting datetime and adjusts it
   * by the timezone.
   */
  toUTCAdjustedDate() {
    // NOTE(mark): It's important that the time is made the exact same date
    // to account for DST. It's also important that the object passed in
    // isn't UTC and is local time.
    const local = new Datetime(this.toLocalDate());
    const adjusted = this.addMinutes(-local.timezoneOffsetInMinutes);

    return adjusted.toLocalDate();
  }

  /**
   * Uses the date object that backs us to display a string representation of
   * the current time that this object holds.
   */
  toString() {
    return this.moment.toString();
  }

  /**
   * Returns an ISO string which is the same format our server returns.
   * Useful for creating client-side data.
   */
  serialize() {
    return this.moment.toISOString();
  }

  /**
   * Returns the date for use on the server.
   * ex. 2016-06-17
   */
  get dateString() {
    return (
      `${this.year}-${this.monthNumberPadded}-${this.dayOfMonthNumberPadded}`
    );
  }

  /**
   * Returns the time as a 4-digit string.
   * ex. 10pm -> 2200
   */
  get timeString() {
    return `${this.fullHour}${this.fullMinutes}`;
  }

  /**
   * Returns the date as a string.
   * ex. 2/12/16
   */
  get displayDate() {
    return (
      `${this.monthNumber}/${this.dayOfMonthNumber}/${this.abbreviatedYear}`
    );
  }

  get timestamp() {
    return `${this.dateString} at ${this.militaryTime}`;
  }

  get fullDate() {
    return `${this.dayName}, ${this.monthWithDayNumber}`;
  }

  /**
   * Returns the formatted datetime in the format:
   * Monday, Jan 20 at 2:30 PM
   */
  get fullDateAndTime() {
    return `${this.fullDate} at ${this.time}`;
  }

  /**
   * Mon, Jan 20 at 2:30pm
   */
  get shortDayDateAndTime() {
    return `${this.shortDayName}, ${this.dateAndTime}`;
  }

  /**
   * Mon, Jan 20, 2016 at 2:30pm
   */
  get shortDayDateWithYearAndTime() {
    return (
      `${this.shortDayName}, ${this.abbreviatedMonthWithDayNumber}, ` +
      `${this.year} at ${this.time}`
    );
  }

  /**
   * Mon, Jan 20
   */
  get shortDayDate() {
    return `${this.shortDayName}, ${this.abbreviatedMonthWithDayNumber}`;
  }

  /**
   * Jan 20, 2016
   */
  get monthDate() {
    return `${this.abbreviatedMonthWithDayNumber}, ${this.year}`;
  }

  /**
   * Jan 20 at 2:30pm
   */
  get dateAndTime() {
    return `${this.abbreviatedMonthWithDayNumber} at ${this.time}`;
  }

  get militaryTime() {
    return `${this.fullHour}${this.fullMinutes}`;
  }

  /**
   * Returns the 12 hour time with no space and a lowercase meridiem.
   * Ex. 2:35pm
   */
  get time() {
    return (
      `${this.twelveHour}:${this.fullMinutes}${_.toLowerCase(this.meridiem)}`
    );
  }

  /**
   * Returns the 12 hour time with seconds.
   */
  get timeWithSeconds() {
    return (
      `${this.twelveHour}:${this.fullMinutes}:${this.fullSeconds} ` +
      `${this.meridiem}`
    );
  }

  /**
   * Returns the 12 hour time with seconds + milliseconds.
   */
  get timeWithMilliseconds() {
    return (
      `${this.twelveHour}:${this.fullMinutes}:${this.fullSeconds}` +
      `.${this.milliseconds}${this.meridiem}`
    );
  }

  get meridiem() {
    return this.hour > 11 ? 'PM' : 'AM';
  }

  /**
   * Returns the time ago in words from the current time.
   */
  get timeInWords() {
    return this.distanceOfTimeInWords(Datetime.now);
  }

  get abbreviatedTimeInWords() {
    return this.abbreviatedDistanceOfTimeInWords(Datetime.now);
  }

  /**
   * Includes the word `ago` in the string except for `Just Now`.
   */
  get timeAgoInWords() {
    const {timeInWords} = this;

    // LOL such a hack. If we change the value of `Just Now`, make sure to
    // change it here.
    return timeInWords === 'Just Now' ? timeInWords : `${timeInWords} ago`;
  }

  distancesBetween(datetime) {
    const minutes = Math.abs(this.minutesBetween(datetime));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    return {minutes, hours, days, weeks, months, years};
  }

  abbreviatedDistanceOfTimeInWords(datetime) {
    const distances = this.distancesBetween(datetime);
    const {minutes, hours, days, weeks, months, years} = distances;

    if (minutes === 0) {
      return `Just Now`;
    } else if (hours < 1) {
      return `${minutes}m`;
    } else if (days < 1) {
      return `${hours}h`;
    } else if (weeks < 1) {
      return `${days}d`;
    } else if (months < 1) {
      return `${weeks}w`;
    } else if (years < 1) {
      return `${months}mo`;
    } else {
      return `${years}y`;
    }
  }

  /**
   * Returns a string representing the distance of time that happened between
   * the datetime and this.
   */
  distanceOfTimeInWords(datetime) {
    const distances = this.distancesBetween(datetime);
    const {minutes, hours, days, weeks, months, years} = distances;

    if (minutes === 0) {
      return `Just Now`;
    } else if (hours < 1) {
      // NOTE(mark): Singular and plural both return `min`.
      return `${minutes} min`;
    } else if (days < 1) {
      return _.pluralize('hour', hours, true);
    } else if (weeks < 1) {
      return _.pluralize('day', days, true);
    } else if (months < 1) {
      return _.pluralize('week', weeks, true);
    } else if (years < 1) {
      return _.pluralize('month', months, true);
    } else {
      return _.pluralize('year', years, true);
    }
  }

  // --------------------------------------------------
  // Relative Time
  // --------------------------------------------------

  /**
   * Returns a string that represents the relative time in days.
   * Currently only returns 'Today', 'Tomorrow', or 'Yesterday'.
   */
  relativeTo(datetime) {
    const daysBetween = datetime.daysBetween(this);
    const absoluteDaysBetween = Math.abs(daysBetween);

    if (daysBetween < -1) {
      return `${absoluteDaysBetween} days ago`;
    } else if (daysBetween === -1) {
      return 'Yesterday';
    } else if (daysBetween === 0) {
      return 'Today';
    } else if (daysBetween === 1) {
      return 'Tomorrow';
    } else {
      return `In ${absoluteDaysBetween} days`;
    }
  }

  get relativeToNow() {
    return this.relativeTo(Datetime.today);
  }

  relativeToInWeeks(datetime) {
    const weeksBetween = datetime.weeksBetween(this);
    const absoluteWeeksBetween = Math.abs(weeksBetween);

    if (weeksBetween < -1) {
      return `${absoluteWeeksBetween} weeks ago`;
    } else if (weeksBetween === -1) {
      return 'Last Week';
    } else if (weeksBetween === 0) {
      return 'This Week';
    } else if (weeksBetween === 1) {
      return 'Next Week';
    } else {
      return `In ${absoluteWeeksBetween} weeks`;
    }
  }

  /**
   * For differences in time, if the number if negative (-0.1), we want
   * to round that to 0, if it's positive (0.1), we also want that to round
   * to zero. Otherwise, we'd have different outcomes when something is
   * a half "day" away.
   */
  roundTowardZero(difference, {precision = 0} = {}) {
    if (difference < 0) {
      return _.ceil(difference, precision);
    } else {
      return _.floor(difference, precision);
    }
  }

  // --------------------------------------------------
  // Years
  // --------------------------------------------------

  /**
   * Returns the year as a 4 digit number.
   */
  get year() {
    return this.moment.year();
  }

  /**
   * Returns the last two digits of the year.
   */
  get abbreviatedYear() {
    return this.year.toString().substring(2, 4);
  }

  // --------------------------------------------------
  // Months
  // --------------------------------------------------

  /**
   * Returns the month and day number for a given datetime.
   * Ex. January 20
   */
  get monthWithDayNumber() {
    return `${this.monthName} ${this.dayOfMonthNumber}`;
  }

  get abbreviatedMonthWithDayNumber() {
    return `${this.abbreviatedMonthName} ${this.dayOfMonthNumber}`;
  }

  /**
   * Returns the month + year.
   * Ex. October 2016
   */
  get monthWithYear() {
    return `${this.monthName} ${this.year}`;
  }

  /**
   * Returns the string representation of a month. Ex. 'January'
   */
  get monthName() {
    return Datetime.MONTHS[this.month];
  }

  /**
   * Returns the first three letters of the month, except for Septemeber (first
   * 4 letters).
   *
   * Ex. 'Jan', 'Feb', 'Mar', ... 'Sept', 'Oct', 'Nov', 'Dec'
   */
  get abbreviatedMonthName() {
    const {monthName} = this;

    switch (monthName) {
      case 'September':
        return _.firstN(monthName, 4);
      default:
        return _.firstN(monthName, 3);
    }
  }

  /**
   * Returns the index of the month one-indexed (from 1-12).
   */
  get monthNumber() {
    return this.months + 1;
  }

  get monthNumberPadded() {
    return _.padStart(this.monthNumber, 2, '0');
  }

  /**
   * Returns the index of the month zero-indexed (from 0-11).
   */
  get month() {
    return this.moment.month();
  }

  get months() {
    return this.month;
  }

  // --------------------------------------------------
  // Weeks
  // --------------------------------------------------

  /**
   * Returns the number of weeks between two datetime objects.
   */
  weeksBetween(datetime, options) {
    return this.roundTowardZero(
      this.millisecondsBetween(datetime) / Datetime.WEEK,
      options,
    );
  }

  /**
   * Returns the number of weeks between now. Positive is the future (1 =
   * next week). Negative is in the past (-1 = last week).
   */
  get weeksFromNow() {
    return Datetime.today.weeksBetween(this);
  }

  // --------------------------------------------------
  // Days
  // --------------------------------------------------
  static dayOfWeek(index) {
    return this.DAYS[index];
  }

  /**
   * Returns the string representation of a day. Ex. 'Monday'
   */
  get dayName() {
    return Datetime.DAYS[this.dayOfWeekNumber];
  }

  /**
   * Returns the short name for the day of the week aka 'Mon'.
   */
  get shortDayName() {
    return this.dayName.substring(0, 3);
  }

  /**
   * Returns the index of the day in a week (from 0-6).
   * Ex. 0 for Sunday, 2 for Tuesday
   */
  get dayOfWeekNumber() {
    return this.moment.day();
  }

  /**
   * Returns the day of the month (from 1-31).
   */
  get days() {
    return this.moment.date();
  }

  get dayOfMonthNumber() {
    return this.days;
  }

  // Returns the number of days in the month: 28, 30, 31.
  get daysInMonth() {
    return this.moment.daysInMonth();
  }

  get dayOfMonthNumberPadded() {
    return _.padStart(this.dayOfMonthNumber, 2, '0');
  }

  /**
   * Returns the number of days between two datetime objects.
   */
  daysBetween(datetime, options) {
    return this.roundTowardZero(
      this.millisecondsBetween(datetime) / Datetime.DAY,
      options,
    );
  }

  /**
   * Returns the number of days between now. Positive is the future (1 =
   * tomorrow). Negative is in the past (-1 = yesterday).
   */
  get daysFromNow() {
    return Datetime.today.daysBetween(this);
  }

  /**
   * Returns the day of the month with a suffix.
   */
  get dayOfMonthWithSuffix() {
    const day = this.dayOfMonthNumber;

    if (day >= 11 && day <= 20) {
      return `${day}th`;
    } else {
      switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
      }
    }
  }

  // --------------------------------------------------
  // Hours
  // --------------------------------------------------

  /**
   * Returns the hour of the day in 24 hour time (from 0-23).
   * Ex. 3pm is 15
   */
  get hours() {
    return this.moment.hours();
  }

  get hour() {
    return this.hours;
  }

  get fullHour() {
    return this.hour < 10 ? `0${this.hour}` : `${this.hour}`;
  }

  /**
   * Returns the 12-hour time representation.
   */
  get twelveHour() {
    let hour = this.hour;

    // Convert to 12 hour time.
    hour = hour % 12;
    return hour === 0 ? 12 : hour;
  }

  get fullTwelveHour() {
    if (this.twelveHour < 10) {
      return `0${this.twelveHour}`;
    } else {
      return this.twelveHour.toString();
    }
  }

  /**
   * Returns the number of hours between two datetime objects.
   */
  hoursBetween(datetime, options) {
    return this.roundTowardZero(
      this.millisecondsBetween(datetime) / Datetime.HOUR,
      options,
    );
  }

  get hoursSince() {
    return this.hoursBetween(Datetime.now);
  }

  get hoursUntil() {
    return Datetime.now.hoursBetween(this);
  }

  /**
   * Rounds the minutes to the nearest hour.
   */
  roundToNearestHour() {
    const {minutes, hour} = this;
    const offset = Math.round(minutes / 60);

    return Datetime.forTime(hour + offset, 0);
  }

  // --------------------------------------------------
  // Minutes
  // --------------------------------------------------

  /**
   * Returns the minute of the hour (from 0-59).
   */
  get minutes() {
    return this.moment.minutes();
  }

  /**
   * Returns the minutes as a two digit string. Useful for showing times on
   * the client.
   */
  get fullMinutes() {
    if (this.minutes < 10) {
      return `0${this.minutes}`;
    } else {
      return this.minutes.toString();
    }
  }

  /**
   * Returns the number of minutes between two datetime objects.
   */
  minutesBetween(datetime, options) {
    return this.roundTowardZero(
      this.millisecondsBetween(datetime) / Datetime.MINUTE,
      options,
    );
  }

  // --------------------------------------------------
  // Seconds
  // --------------------------------------------------

  /**
   * Returns the seconds of the minute (from 0-59).
   */
  get seconds() {
    return this.moment.seconds();
  }

  /**
   * Returns the seconds as a two digit string. Useful for showing times on
   * the client.
   */
  get fullSeconds() {
    if (this.seconds < 10) {
      return `0${this.seconds}`;
    } else {
      return this.seconds.toString();
    }
  }

  /**
   * Returns the number of seconds between two datetime objects.
   */
  secondsBetween(datetime, options) {
    return this.roundTowardZero(
      this.millisecondsBetween(datetime) / Datetime.SECOND,
      options,
    );
  }

  // --------------------------------------------------
  // Milliseconds
  // --------------------------------------------------

  /**
   * Returns the milliseconds for the current time (from 0-999).
   */
  get milliseconds() {
    return this.moment.milliseconds();
  }

  /**
   * Returns the number of milliseconds since midnight January 1, 1970.
   */
  get millisecondsSinceEpoch() {
    return this.moment.valueOf();
  }

  /**
   * Returns the number of milliseconds between two datetime objects.
   */
  millisecondsBetween(datetime) {
    return datetime.millisecondsSinceEpoch - this.millisecondsSinceEpoch;
  }

}


export default Datetime;
