// Modules
import Datetime from '../Datetime';


/* eslint-disable no-undef */
describe('Datetime', () => {

  // --------------------------------------------------
  //
  // Static
  //
  // --------------------------------------------------

  // --------------------------------------------------
  // Constructor
  // --------------------------------------------------
  describe('constructor', () => {
    describe('with date object', () => {
      set('datetime', () => {
        return new Datetime(new Date(2016, 11, 21, 2, 30, 5, 200));
      });

      subject(() => datetime);
      its('year', () => isExpected.toBe(2016));
      its('monthNumber', () => isExpected.toBe(12));
      its('dayOfMonthNumber', () => isExpected.toBe(21));
      its('hour', () => isExpected.toBe(2));
      its('minutes', () => isExpected.toBe(30));
      its('seconds', () => isExpected.toBe(5));
      its('milliseconds', () => isExpected.toBe(200));
      its('isEmpty', () => isExpected.toBe(false));
    });

    describe('with string', () => {
      set('datetime', () => {
        return new Datetime('2016-12-21T02:30:05.200Z', {utc: true});
      });

      subject(() => datetime);
      its('year', () => isExpected.toBe(2016));
      its('monthNumber', () => isExpected.toBe(12));
      its('dayOfMonthNumber', () => isExpected.toBe(21));
      its('hour', () => isExpected.toBe(2));
      its('minutes', () => isExpected.toBe(30));
      its('seconds', () => isExpected.toBe(5));
      its('milliseconds', () => isExpected.toBe(200));
      its('isEmpty', () => isExpected.toBe(false));
    });

    describe('with integer', () => {
      set('datetime', () => {
        return new Datetime(1482287405200, {utc: true});
      });

      subject(() => datetime);
      its('year', () => isExpected.toBe(2016));
      its('monthNumber', () => isExpected.toBe(12));
      its('dayOfMonthNumber', () => isExpected.toBe(21));
      its('hour', () => isExpected.toBe(2));
      its('minutes', () => isExpected.toBe(30));
      its('seconds', () => isExpected.toBe(5));
      its('milliseconds', () => isExpected.toBe(200));
      its('isEmpty', () => isExpected.toBe(false));
    });

    describe('with null', () => {
      set('datetime', () => new Datetime(null));

      subject(() => datetime);
      its('year', () => isExpected.toBe(1970));
      its('monthNumber', () => isExpected.toBe(1));
      its('dayOfMonthNumber', () => isExpected.toBe(1));
      its('hour', () => isExpected.toBe(0));
      its('minutes', () => isExpected.toBe(0));
      its('seconds', () => isExpected.toBe(0));
      its('milliseconds', () => isExpected.toBe(0));
      its('isEmpty', () => isExpected.toBe(true));
    });

    describe('with undefined', () => {
      // Thursday, January 1, 1970 at 12:00am.
      set('datetime', () => new Datetime());

      subject(() => datetime);
      its('year', () => isExpected.toBe(1970));
      its('monthNumber', () => isExpected.toBe(1));
      its('dayOfMonthNumber', () => isExpected.toBe(1));
      its('hour', () => isExpected.toBe(0));
      its('minutes', () => isExpected.toBe(0));
      its('seconds', () => isExpected.toBe(0));
      its('milliseconds', () => isExpected.toBe(0));
      its('isEmpty', () => isExpected.toBe(true));

      describe('string methods', () => {
        subject(() => datetime);
        its('toString', () => isExpected.toBe(
          'Thu Jan 01 1970 00:00:00 GMT+0000',
        ));
        its('serialize', () => isExpected.toBe('1970-01-01T00:00:00.000Z'));
        its('dateString', () => isExpected.toBe('1970-01-01'));
        its('displayDate', () => isExpected.toBe('1/1/70'));
        its('fullDate', () => isExpected.toBe('Thursday, January 1'));
        its('fullDateAndTime', () => {
          return isExpected.toBe('Thursday, January 1 at 12:00am');
        });
        its('timeString', () => isExpected.toBe('0000'));
        its('time', () => isExpected.toBe('12:00am'));
      });
    });
  });

  describe('.fromInteger', () => {
    set('integer', () => 1482287405200);
    set('datetime', () => Datetime.fromInteger(integer, {utc: true}));

    subject(() => datetime);
    its('year', () => isExpected.toBe(2016));
    its('monthNumber', () => isExpected.toBe(12));
    its('dayOfMonthNumber', () => isExpected.toBe(21));
    its('hour', () => isExpected.toBe(2));
    its('minutes', () => isExpected.toBe(30));
    its('seconds', () => isExpected.toBe(5));
    its('milliseconds', () => isExpected.toBe(200));
    its('isEmpty', () => isExpected.toBe(false));
  });

  describe('.fromTimeString', () => {
    describe('default cases', () => {
      describe('with valid params', () => {
        const eightAM = [
          '08:00AM',
          '08:00A',
          '08:00am',
          '08:00a',
          '0800',
          '800',
          '8',
          '8am',
          '8a',
        ];

        forEach({string: eightAM}, () => {
          it('returns 8am', () => {
            expect(Datetime.fromTimeString(string).militaryTime).toBe('0800');
          });
        });

        const eightPM = [
          '08:00PM',
          '08:00P',
          '08:00pm',
          '08:00p',
          '2000',
          '20',
          '8pm',
          '8p',
        ];

        forEach({string: eightPM}, () => {
          it('returns 8pm', () => {
            expect(Datetime.fromTimeString(string).militaryTime).toBe('2000');
          });
        });
      });

      describe('with invalid params', () => {
        const strings = [
          '200:00pm',
          '0:0am',
          '8bm',
          '10101',
          '0am',
          '20pm',
          'am100',
          'am1',
          'am',
          'PM',
        ];

        forEach({string: strings}, () => {
          it('returns the empty datetime', () => {
            expect(Datetime.fromTimeString(string).isEmpty).toBe(true);
          });
        });
      });
    });

    describe('with colon in string', () => {
      describe('with valid params', () => {
        const strings = [
          '12:34',
          '12:89',
          '01:12',
          '1:14',
        ];

        forEach({string: strings}, () => {
          it('is not empty for valid strings', () => {
            expect(Datetime.fromTimeString(string).isEmpty).toBe(false);
          });
        });
      });

      describe('with invalid params', () => {
        const strings = [
          '9:0',
          '1::12',
          '12:123',
          '12:1pm',
          '12:am',

          // This used to cause an error but I fixed it heh.
          ':',
        ];

        forEach({string: strings}, () => {
          it('returns the empty datetime for invalid strings', () => {
            expect(Datetime.fromTimeString(string).isEmpty).toBe(true);
          });
        });
      });

      describe('edge cases', () => {
        it('converts uppercase meridiem', () => {
          expect(Datetime.fromTimeString('08:00PM').militaryTime).toBe('2000');
        });

        it('converts lowercase meridiem', () => {
          expect(Datetime.fromTimeString('09:00pm').militaryTime).toBe('2100');
        });

        it('converts 12:00pm to noon', () => {
          expect(Datetime.fromTimeString('12:00pm').militaryTime).toBe('1200');
        });

        it('converts 12:00am to midnight', () => {
          expect(Datetime.fromTimeString('12:00am').militaryTime).toBe('0000');
        });
      });
    });

    describe('with military time', () => {
      it('converts before noon correctly', () => {
        expect(Datetime.fromTimeString('0100').militaryTime).toBe('0100');
      });

      it('converts after noon correctly', () => {
        expect(Datetime.fromTimeString('1500').militaryTime).toBe('1500');
      });
    });

    describe('with only numbers', () => {
      it('converts a single digit hour correctly', () => {
        expect(Datetime.fromTimeString('8').militaryTime).toBe('0800');
      });

      it('converts a double digit hour correctly', () => {
        expect(Datetime.fromTimeString('11').militaryTime).toBe('1100');
      });

      it('converts a 24-hour hour correctly', () => {
        expect(Datetime.fromTimeString('20').militaryTime).toBe('2000');
      });
    });

    describe('with numbers and meridiem', () => {
      it('converts a single hour with am meridiem correctly', () => {
        expect(Datetime.fromTimeString('8am').militaryTime).toBe('0800');
      });

      it('converts a double digit hour with am meridiem correctly', () => {
        expect(Datetime.fromTimeString('11am').militaryTime).toBe('1100');
      });

      it('converts a single hour with pm meridiem correctly', () => {
        expect(Datetime.fromTimeString('8pm').militaryTime).toBe('2000');
      });

      it('converts a double digit hour with pm meridiem correctly', () => {
        expect(Datetime.fromTimeString('11pm').militaryTime).toBe('2300');
      });

      it('converts a single hour with capital AM meridiem correctly', () => {
        expect(Datetime.fromTimeString('8AM').militaryTime).toBe('0800');
      });
    });
  });

  describe('.isValidString', () => {
    describe('with valid datetime string', () => {
      const strings = [
        '2016-03-21T00:00:00.200Z',
        '2016-03-21T00:00:00',
      ];

      forEach({string: strings}, () => {
        it(`returns true`, () => {
          expect(Datetime.isValidString(string)).toBe(true);
        });
      });
    });

    describe('with invalid datetime string', () => {
      const strings = [
        '',
        undefined,
        null,
      ];

      forEach({string: strings}, () => {
        it(`returns true`, () => {
          expect(Datetime.isValidString(string)).toBe(false);
        });
      });
    });
  });

  describe('.isValidDatetime', () => {
    context('with valid datetime', () => {
      const datetimes = [
        Datetime.today,
        new Datetime('2016-03-21T00:00:00.200Z'),
      ];

      forEach({datetime: datetimes}, () => {
        it('returns true', () => {
          expect(Datetime.isValidDatetime(datetime)).toBe(true);
        });
      });
    });

    context('with invalid datetime', () => {
      const datetimes = [
        new Datetime(),
        '2016-03-21T00:00:00.200Z',
      ];

      forEach({datetime: datetimes}, () => {
        it('returns false', () => {
          expect(Datetime.isValidDatetime(datetime)).toBe(false);
        });
      });
    });
  });

  describe('.utc', () => {
    describe('raw date-only string', () => {
      set('datetime', () => Datetime.utc('2016-12-04'));

      subject(() => datetime);
      its('dateString', () => isExpected.toBe('2016-12-04'));

      // Time should be midnight for date-only strings.
      its('militaryTime', () => isExpected.toBe('0000'));
    });
  });

  // --------------------------------------------------
  // Relative
  // --------------------------------------------------
  describe('relative dates', () => {
    // Monday, December 5th, 2016 at 6pm. Not setting this to UTC causes
    // some bugs with the `.today` method which ends up affecting everything
    // else.
    clock.set(Datetime.create('2016-12-05T18:00:00.000'));

    describe('.beginningOfWeek', () => {
      it('returns the time at midnight', () => {
        expect(Datetime.beginningOfWeek.militaryTime).toBe('0000');
      });

      it('returns the correct date', () => {
        expect(Datetime.beginningOfWeek.dateString).toBe('2016-12-04');
      });
    });

    describe('.yesterday', () => {
      it('returns the time at midnight', () => {
        expect(Datetime.yesterday.militaryTime).toBe('0000');
      });

      it('returns the correct date', () => {
        expect(Datetime.yesterday.dateString).toBe('2016-12-04');
      });
    });

    describe('.today', () => {
      it('returns the time at midnight', () => {
        expect(Datetime.today.militaryTime).toBe('0000');
      });

      it('returns the correct date', () => {
        expect(Datetime.today.dateString).toBe('2016-12-05');
      });
    });

    describe('.tomorrow', () => {
      it('returns the time at midnight', () => {
        expect(Datetime.tomorrow.militaryTime).toBe('0000');
      });

      it('returns the correct date', () => {
        expect(Datetime.tomorrow.dateString).toBe('2016-12-06');
      });
    });

    describe('.dayAfterTomorrow', () => {
      it('returns the time at midnight', () => {
        expect(Datetime.dayAfterTomorrow.militaryTime).toBe('0000');
      });

      it('returns the correct date', () => {
        expect(Datetime.dayAfterTomorrow.dateString).toBe('2016-12-07');
      });
    });
  });

  describe('relative time', () => {
    // Tuesday, January 31, 2017 at 2:30am.
    clock.set(Datetime.create('2017-01-31T02:30:00.000Z', {utc: true}));
    set('datetime', () => new Datetime(now, {utc: true}));

    describe('less than a minute after', () => {
      set('now', () => '2017-01-31T02:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('Just Now'));
      its('timeInWords', () => isExpected.toBe('Just Now'));
      its('timeAgoInWords', () => isExpected.toBe('Just Now'));
    });

    describe('exactly a minute after', () => {
      set('now', () => '2017-01-31T02:31:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('1m'));
      its('timeInWords', () => isExpected.toBe('1 min'));
      its('timeAgoInWords', () => isExpected.toBe('1 min ago'));
    });

    describe('after a minute, less than an hour after', () => {
      set('now', () => '2017-01-31T02:35:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('5m'));
      its('timeInWords', () => isExpected.toBe('5 min'));
      its('timeAgoInWords', () => isExpected.toBe('5 min ago'));
    });

    describe('exactly an hour after', () => {
      set('now', () => '2017-01-31T03:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('1h'));
      its('timeInWords', () => isExpected.toBe('1 hour'));
      its('timeAgoInWords', () => isExpected.toBe('1 hour ago'));
    });

    describe('after an hour, less than a day after', () => {
      set('now', () => '2017-01-31T05:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('3h'));
      its('timeInWords', () => isExpected.toBe('3 hours'));
      its('timeAgoInWords', () => isExpected.toBe('3 hours ago'));
    });

    describe('exactly a day after', () => {
      set('now', () => '2017-02-01T02:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('1d'));
      its('timeInWords', () => isExpected.toBe('1 day'));
      its('timeAgoInWords', () => isExpected.toBe('1 day ago'));
    });

    describe('after a day, less than a week after', () => {
      set('now', () => '2017-02-03T02:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('3d'));
      its('timeInWords', () => isExpected.toBe('3 days'));
      its('timeAgoInWords', () => isExpected.toBe('3 days ago'));
    });

    describe('exactly a week after', () => {
      set('now', () => '2017-02-07T02:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('1w'));
      its('timeInWords', () => isExpected.toBe('1 week'));
      its('timeAgoInWords', () => isExpected.toBe('1 week ago'));
    });

    describe('after a week, less than a month after', () => {
      set('now', () => '2017-02-27T02:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('3w'));
      its('timeInWords', () => isExpected.toBe('3 weeks'));
      its('timeAgoInWords', () => isExpected.toBe('3 weeks ago'));
    });

    describe('exactly a month after', () => {
      set('now', () => '2017-03-03T02:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('1mo'));
      its('timeInWords', () => isExpected.toBe('1 month'));
      its('timeAgoInWords', () => isExpected.toBe('1 month ago'));
    });

    describe('after a month, less than a year after', () => {
      set('now', () => '2017-06-30T02:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('5mo'));
      its('timeInWords', () => isExpected.toBe('5 months'));
      its('timeAgoInWords', () => isExpected.toBe('5 months ago'));
    });

    describe('exactly a year after', () => {
      set('now', () => '2018-01-31T02:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('1y'));
      its('timeInWords', () => isExpected.toBe('1 year'));
      its('timeAgoInWords', () => isExpected.toBe('1 year ago'));
    });

    describe('after a year, less than a decade after', () => {
      set('now', () => '2020-01-31T02:30:00.000Z');

      subject(() => datetime);
      its('abbreviatedTimeInWords', () => isExpected.toBe('3y'));
      its('timeInWords', () => isExpected.toBe('3 years'));
      its('timeAgoInWords', () => isExpected.toBe('3 years ago'));
    });
  });

  // --------------------------------------------------
  //
  // Instance
  //
  // --------------------------------------------------

  // --------------------------------------------------
  // Set
  // --------------------------------------------------
  describe('#setTimeValues', () => {
    set('datetime', () => Datetime.fromTimeString('0800'));

    describe('sets hours to before noon', () => {
      it('without minutes', () => {
        expect(datetime.setTimeValues({hour: 2}).hour).toBe(2);
      });

      it('with minutes', () => {
        expect(datetime.setTimeValues({hour: 3, minutes: 30}).hour).toBe(3);
      });
    });

    describe('sets hours to after noon', () => {
      it('without minutes', () => {
        expect(datetime.setTimeValues({hour: 14}).hour).toBe(14);
      });

      it('with minutes', () => {
        expect(datetime.setTimeValues({hour: 16, minutes: 30}).hour).toBe(16);
      });
    });
  });

  // --------------------------------------------------
  // Add
  // --------------------------------------------------
  describe('#addHours', () => {
    describe('starts before noon', () => {
      set('datetime', () => Datetime.fromTimeString('1000'));

      it('adds to after noon', () => {
        expect(datetime.addHours(3).hour).toBe(13);
      });

      it('adds to before noon', () => {
        expect(datetime.addHours(1).hour).toBe(11);
      });

      it('adds negative numbers to before noon', () => {
        expect(datetime.addHours(-2).hour).toBe(8);
      });
    });

    describe('starts after noon', () => {
      set('datetime', () => Datetime.fromTimeString('1400'));

      it('adds to after noon', () => {
        expect(datetime.addHours(5).hour).toBe(19);
      });

      it('adds negative numbers to after noon', () => {
        expect(datetime.addHours(-1).hour).toBe(13);
      });

      it('adds negative numbers to before noon', () => {
        expect(datetime.addHours(-5).hour).toBe(9);
      });
    });
  });

  // --------------------------------------------------
  // Between
  // --------------------------------------------------
  describe('time between', () => {
    describe('within a day', () => {
      set('datetime', () => Datetime.fromTimeString('1000'));
      set('future', () => Datetime.fromTimeString('1600'));
      set('past', () => Datetime.fromTimeString('0800'));

      describe('2 hours in the past', () => {
        it('returns days between', () => {
          expect(datetime.daysBetween(past)).toBe(0);
        });

        it('returns hours between', () => {
          expect(datetime.hoursBetween(past)).toBe(-2);
        });

        it('returns minutes between', () => {
          expect(datetime.minutesBetween(past)).toBe(-120);
        });
      });

      describe('6 hours in the future', () => {
        it('returns days between', () => {
          expect(datetime.daysBetween(future)).toBe(0);
        });

        it('returns hours between', () => {
          expect(datetime.hoursBetween(future)).toBe(6);
        });

        it('returns minutes between', () => {
          expect(datetime.minutesBetween(future)).toBe(360);
        });
      });
    });

    /**
     * TODO(mark): When daylight savings time hits, relative times where
     * one side of the time is in front and the other side of the time is
     * behind will fail because we're not taking the timezone change into
     * account.
     */
    describe('spanning DST', () => {
      // Set the `datetime` to before DST and the current time to after.
      set('now', () => '2017-03-12T01:00:00.000 -0800');
      set('datetime', () => Datetime.create(now));
      clock.set(Datetime.create('2017-03-12T03:00:00.000 -0700'));

      describe('time between', () => {
        it('returns the correct hours between', () => {
          expect(datetime.hoursBetween(Datetime.now)).toBe(1);
        });

        it('returns the correct hours since', () => {
          expect(datetime.hoursSince).toBe(1);
        });

        it('returns the correct hours until', () => {
          expect(datetime.hoursUntil).toBe(-1);
        });
      });
    });
  });

  // --------------------------------------------------
  // Relative
  // --------------------------------------------------
  describe('relative dates', () => {
    set('datetime', () => Datetime.utc('2016-12-15'));

    describe('2 weeks in the past', () => {
      clock.set(Datetime.create('2016-12-29'));

      subject(() => datetime);
      its('daysFromNow', () => isExpected.toBe(-14));
      its('weeksFromNow', () => isExpected.toBe(-2));
      its('relativeToNow', () => isExpected.toBe('14 days ago'));

      its('isYesterday', () => isExpected.toBe(false));
      its('isToday', () => isExpected.toBe(false));
      its('isTomorrow', () => isExpected.toBe(false));
    });

    describe('1 week in the past', () => {
      clock.set(Datetime.create('2016-12-22'));

      subject(() => datetime);
      its('daysFromNow', () => isExpected.toBe(-7));
      its('weeksFromNow', () => isExpected.toBe(-1));
      its('relativeToNow', () => isExpected.toBe('7 days ago'));

      its('isYesterday', () => isExpected.toBe(false));
      its('isToday', () => isExpected.toBe(false));
      its('isTomorrow', () => isExpected.toBe(false));
    });

    describe('yesterday', () => {
      clock.set(Datetime.create('2016-12-16'));

      subject(() => datetime);
      its('daysFromNow', () => isExpected.toBe(-1));
      its('weeksFromNow', () => isExpected.toBe(0));
      its('relativeToNow', () => isExpected.toBe('Yesterday'));

      its('isYesterday', () => isExpected.toBe(true));
      its('isToday', () => isExpected.toBe(false));
      its('isTomorrow', () => isExpected.toBe(false));
    });

    describe('today', () => {
      clock.set(Datetime.create('2016-12-15'));

      subject(() => datetime);
      its('daysFromNow', () => isExpected.toBe(0));
      its('weeksFromNow', () => isExpected.toBe(0));
      its('relativeToNow', () => isExpected.toBe('Today'));

      its('isYesterday', () => isExpected.toBe(false));
      its('isToday', () => isExpected.toBe(true));
      its('isTomorrow', () => isExpected.toBe(false));
    });

    describe('tomorrow', () => {
      clock.set(Datetime.create('2016-12-14'));

      subject(() => datetime);
      its('daysFromNow', () => isExpected.toBe(1));
      its('weeksFromNow', () => isExpected.toBe(0));
      its('relativeToNow', () => isExpected.toBe('Tomorrow'));

      its('isYesterday', () => isExpected.toBe(false));
      its('isToday', () => isExpected.toBe(false));
      its('isTomorrow', () => isExpected.toBe(true));
    });

    describe('1 week from now', () => {
      clock.set(Datetime.create('2016-12-08'));

      subject(() => datetime);
      its('daysFromNow', () => isExpected.toBe(7));
      its('weeksFromNow', () => isExpected.toBe(1));
      its('relativeToNow', () => isExpected.toBe('In 7 days'));

      its('isYesterday', () => isExpected.toBe(false));
      its('isToday', () => isExpected.toBe(false));
      its('isTomorrow', () => isExpected.toBe(false));
    });

    describe('2 weeks from now', () => {
      clock.set(Datetime.create('2016-12-01'));

      subject(() => datetime);
      its('daysFromNow', () => isExpected.toBe(14));
      its('weeksFromNow', () => isExpected.toBe(2));
      its('relativeToNow', () => isExpected.toBe('In 14 days'));

      its('isYesterday', () => isExpected.toBe(false));
      its('isToday', () => isExpected.toBe(false));
      its('isTomorrow', () => isExpected.toBe(false));
    });
  });

  // --------------------------------------------------
  // Months
  // --------------------------------------------------
  describe('months', () => {
    set('month', () => null);
    set('datetime', () => Datetime.forDate(`2016-${month}-01`));

    describe('for January', () => {
      set('month', () => '01');

      subject(() => datetime);
      its('monthName', () => isExpected.toBe('January'));
      its('abbreviatedMonthName', () => isExpected.toBe('Jan'));
      its('month', () => isExpected.toBe(0));
      its('monthNumber', () => isExpected.toBe(1));
      its('monthNumberPadded', () => isExpected.toBe('01'));
    });

    describe('for September', () => {
      set('month', () => '09');

      subject(() => datetime);
      its('monthName', () => isExpected.toBe('September'));

      // NOTE(mark): Special case for September (4 letter abbreviation).
      its('abbreviatedMonthName', () => isExpected.toBe('Sept'));
      its('month', () => isExpected.toBe(8));
      its('monthNumber', () => isExpected.toBe(9));
      its('monthNumberPadded', () => isExpected.toBe('09'));
    });

    describe('for December', () => {
      set('month', () => '12');

      subject(() => datetime);
      its('monthName', () => isExpected.toBe('December'));
      its('abbreviatedMonthName', () => isExpected.toBe('Dec'));
      its('month', () => isExpected.toBe(11));
      its('monthNumber', () => isExpected.toBe(12));
      its('monthNumberPadded', () => isExpected.toBe('12'));
    });
  });

});
