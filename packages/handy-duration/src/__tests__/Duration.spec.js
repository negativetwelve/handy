// Imports
import Duration from '../Duration';


/* eslint-disable no-undef */
describe('Duration', () => {
  context('with seconds only', () => {
    set('duration', () => new Duration({seconds}));

    context('with undefined', () => {
      set('seconds', () => undefined);

      subject(() => duration);
      its('toSeconds', () => isExpected.toBe(0));
      its('toSecondsText', () => isExpected.toBe('0 sec'));
      its('toMinutes', () => isExpected.toBe(0));
      its('toMinutesText', () => isExpected.toBe('0 min'));
    });
  });
});
