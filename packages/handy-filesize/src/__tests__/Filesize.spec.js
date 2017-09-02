// Modules
import Filesize from '../Filesize';


/* eslint-disable no-undef */
describe('Filesize', () => {

  // --------------------------------------------------
  // Constructor
  // --------------------------------------------------
  describe('constructor', () => {
    describe('with bytes only', () => {
      set('filesize', () => new Filesize({bytes}));

      describe('with undefined', () => {
        set('bytes', () => undefined);

        subject(() => filesize);
        its('toBytes', () => isExpected.toBe(0));
        its('toKilobytes', () => isExpected.toBe(0));
        its('toMegabytes', () => isExpected.toBe(0));
        its('toGigabytes', () => isExpected.toBe(0));
        its('toTerabytes', () => isExpected.toBe(0));
        its('toPetabytes', () => isExpected.toBe(0));

        its('toBytesText', () => isExpected.toBe('0 B'));
        its('toKilobytesText', () => isExpected.toBe('0 kB'));
        its('toMegabytesText', () => isExpected.toBe('0 MB'));
        its('toGigabytesText', () => isExpected.toBe('0 GB'));
        its('toTerabytesText', () => isExpected.toBe('0 TB'));
        its('toPetabytesText', () => isExpected.toBe('0 PB'));

        its('toLargestDenomination', () => isExpected.toBe('0 B'));
        its('toString', () => isExpected.toBe('0 B'));
      });

      describe('with value', () => {
        set('bytes', () => 100000000);

        subject(() => filesize);
        its('toBytes', () => isExpected.toBe(100000000));
        its('toKilobytes', () => isExpected.toBe(100000));
        its('toMegabytes', () => isExpected.toBe(100));
        its('toGigabytes', () => isExpected.toBe(0.1));
        its('toTerabytes', () => isExpected.toBe(0.0001));
        its('toPetabytes', () => isExpected.toBe(1e-7));

        its('toBytesText', () => isExpected.toBe('100000000 B'));
        its('toKilobytesText', () => isExpected.toBe('100000 kB'));
        its('toMegabytesText', () => isExpected.toBe('100 MB'));
        its('toGigabytesText', () => isExpected.toBe('0.1 GB'));
        its('toTerabytesText', () => isExpected.toBe('0 TB'));
        its('toPetabytesText', () => isExpected.toBe('0 PB'));

        its('toLargestDenomination', () => isExpected.toBe('100 MB'));
        its('toString', () => isExpected.toBe('100 MB'));
      });
    });
  });

});
