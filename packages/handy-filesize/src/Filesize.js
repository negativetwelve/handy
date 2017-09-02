// Libraries
import invariant from 'invariant';
import _ from 'jolt-lodash';


class Filesize {

  // We're going with the standard that Mac OS X went with and that's powers
  // of 1000, not 1024.
  static constant = 1000;
  static powers = _.range(0, 5);
  static abbreviations = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];

  constructor({bytes = 0} = {}) {
    // TODO(mark): Augment when we have kb, mb, gb, etc.
    this.value = _.toNumber(bytes);
  }

  convertByPower({power, precision} = {}) {
    const multiplier = Math.pow(this.constructor.constant, power);
    const converted = this.value / multiplier;

    // If there's no precision value, return the raw value.
    return precision ? _.round(converted, precision) : converted;
  }

  getAbbreviation(power) {
    return this.constructor.abbreviations[power];
  }

  // --------------------------------------------------
  // Integer
  // --------------------------------------------------
  toBytes({precision} = {}) {
    return this.convertByPower({power: 0, precision});
  }

  toKilobytes({precision} = {}) {
    return this.convertByPower({power: 1, precision});
  }

  toMegabytes({precision} = {}) {
    return this.convertByPower({power: 2, precision});
  }

  toGigabytes({precision} = {}) {
    return this.convertByPower({power: 3, precision});
  }

  toTerabytes({precision} = {}) {
    return this.convertByPower({power: 4, precision});
  }

  toPetabytes({precision} = {}) {
    return this.convertByPower({power: 5, precision});
  }

  // --------------------------------------------------
  // String
  // --------------------------------------------------
  toString() {
    return this.toLargestDenomination();
  }

  toText({power, precision}) {
    const value = this.convertByPower({power, precision});
    const abbreviation = this.getAbbreviation(power);

    return `${value} ${abbreviation}`;
  }

  toBytesText() {
    return this.toText({power: 0, precision: 1});
  }

  toKilobytesText() {
    return this.toText({power: 1, precision: 1});
  }

  toMegabytesText() {
    return this.toText({power: 2, precision: 1});
  }

  toGigabytesText() {
    return this.toText({power: 3, precision: 1});
  }

  toTerabytesText() {
    return this.toText({power: 4, precision: 1});
  }

  toPetabytesText() {
    return this.toText({power: 5, precision: 1});
  }

  /**
   * Gets the highest power for a given threshold.
   */
  getHighestPower() {
    // Special case because 0 to the power of 0 is 1 (which will return
    // kilobytes instead).
    if (this.value === 0) {
      return 0;
    }

    const {constant, powers} = this.constructor;
    const highestPower = _.find(powers, power => {
      const converted = this.convertByPower({power});

      if (converted < constant) {
        return power;
      }
    });

    return highestPower || 0;
  }

  /**
   * Returns the string of the highest denomination that returns a number
   * greater than threshold.
   */
  toLargestDenomination({precision = 1} = {}) {
    return this.toText({power: this.getHighestPower(), precision});
  }

}


export default Filesize;
