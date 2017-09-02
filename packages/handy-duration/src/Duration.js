// Libraries
import invariant from 'invariant';


/**
 * Helper module that takes in values of time that represent a duration and
 * lets us transform it into various other duration denominations.
 */
class Duration {

  constructor({seconds = 0} = {}) {
    // TODO(mark): Augment when we have minutes, hours, etc.
    this.value = seconds;
  }

  // --------------------------------------------------
  // Integer
  // --------------------------------------------------
  toSeconds() {
    return this.value;
  }

  toMinutes() {
    return Math.round(this.toSeconds() / 60);
  }

  // --------------------------------------------------
  // String
  // --------------------------------------------------
  toSecondsText() {
    return `${this.toSeconds()} sec`;
  }

  toMinutesText() {
    return `${this.toMinutes()} min`;
  }

}


export default Duration;
