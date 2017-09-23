// Libraries
import parse from 'url-parse';
import validUrl from 'valid-url';
import qs from 'qs';
import _ from 'jolt-lodash';


const IMAGE_EXTENSIONS = ['gif', 'ico', 'jpeg', 'jpg', 'png'];
const HTML_EXTENSIONS = ['html', 'htm'];

class Url {

  static IMAGE_EXTENSIONS = IMAGE_EXTENSIONS;
  static HTML_EXTENSIONS = HTML_EXTENSIONS;

  static fromSearch(string) {
    const url = new this();

    url.search = string;
    return url;
  }

  /**
   * TODO(mark): Move this to a separate utility function.
   * Converts a blob url of type:
   *
   *   "blob:http://localhost:9000/990fc673-0c62-4a2e-8a4d-2dd771e34847"
   *
   * into a base64 string.
   */
  static async toData(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.responseType = 'blob';
      xhr.onerror = () => {
        reject(
          new Error('Error converting a blob url to a valid base64 string.'),
        );
      };

      xhr.onload = () => {
        const {response} = xhr;
        const reader = new FileReader();

        reader.onloadend = () => {
          const {result} = reader;

          // Result has the content type at the beginning of the string.
          // Example: `data:image/png;base64,...`
          const base64 = _.last(result.split(','));

          resolve(base64);
        };

        reader.readAsDataURL(response);
      };

      xhr.open('GET', url);
      xhr.send();
    });
  }

  constructor(url, query = {}, body = {}) {
    this.url = url || '';
    this.query = query;
    this.body = qs.stringify(body);
  }

  get parsed() {
    return parse(this.url);
  }

  toString() {
    return this.asAbsolute();
  }

  asRelative() {
    if (this.isAbsolute) {
      return this.withoutHostname;
    } else {
      return this.url;
    }
  }

  asAbsolute() {
    if (this.isAbsolute) {
      return this.parsed.toString();
    } else {
      // TODO(mark): Assuming http which is not perfect.
      return `http://${this.url}`;
    }
  }

  get isValid() {
    // isWebUri is more strict than the isUri method.
    return !!validUrl.isWebUri(this.url);
  }

  get hasUrl() {
    return !_.isEmpty(this.url);
  }

  get path() {
    return this.url.split('?')[0] || '';
  }

  get pathname() {
    return this.parsed.pathname;
  }

  get pathWithoutHost() {
    return this.pathname.replace('/', '');
  }

  /**
   * Returns an array of the path without the domain name.
   */
  get splitPath() {
    return _.split(this.pathWithoutHost, '/');
  }

  get hasSearch() {
    return !_.isEmpty(this.search);
  }

  get search() {
    // 'google.com?foo=unicorn&ilike=pizza' => 'foo=unicorn&ilike=pizza'
    return this.url.split('?')[1] || '';
  }

  set search(string) {
    this.query = qs.parse(string);
  }

  /**
   * Setting the query with an object converts the key / values to a string
   * and attaches to the url.
   */
  set query(params) {
    const search = qs.stringify(params);

    // Updates the backing url to include the query params.
    this.url = search ? `${this.path}?${search}` : this.url;
  }

  /**
   * Returns an object of the key / values in the query string.
   * Ex. '?foo=unicorn&ilike=pizza' => {'foo': 'unicorn', 'ilike': 'pizza'}
   */
  get query() {
    return qs.parse(this.search);
  }

  // --------------------------------------------------
  // Protocol
  // --------------------------------------------------

  /**
   * Returns the protocol for the given url (or null if it does not have a
   * protocol).
   */
  get protocol() {
    const {protocol} = this.parsed;

    switch (protocol) {
      case '':
        return null;
      case 'about:':
        // If the url doesn't have a protocol, the parse(url) method returns
        // `about` for `about:blank`.
        return null;
      default:
        // We want to remote the colon from the end of the protocol.
        return protocol.replace(':', '');
    }
  }

  get hasProtocol() {
    return this.protocol !== null;
  }

  /**
   * Returns whether or not a url includes the protocol.
   */
  get isAbsolute() {
    return this.hasUrl && this.hasProtocol;
  }

  /**
   * Returns true if the url is absolute and uses the https protocol.
   */
  get isSecure() {
    return this.isAbsolute && this.protocol === 'https';
  }

  get withoutProtocol() {
    return this.url.replace(this.protocol, '');
  }

  // --------------------------------------------------
  // Host / Hostname
  // --------------------------------------------------
  get hostname() {
    return this.parsed.hostname;
  }

  get domain() {
    return _.first(_.lastN(this.hostname.split('.'), 2));
  }

  get tld() {
    return _.last(this.hostname.split('.'));
  }

  get withoutHostname() {
    if (this.hasSearch) {
      return `${this.pathname}?${this.search}`;
    } else {
      return this.pathname;
    }
  }

  // --------------------------------------------------
  // Filename
  // --------------------------------------------------
  get filename() {
    return _.last(this.url.split('/'));
  }

  get splitFilename() {
    return _.split(this.filename, '.');
  }

  get hasExtension() {
    return this.splitFilename.length >= 2;
  }

  get fileBasename() {
    // Since we split by periods, we need to join back together via periods.
    if (this.hasExtension) {
      return _.initial(this.splitFilename).join('.');
    } else {
      return this.splitFilename.join('.');
    }
  }

  get extension() {
    if (this.hasExtension) {
      return _.last(this.splitFilename);
    } else {
      return '';
    }
  }

  get isImage() {
    return _.includes(IMAGE_EXTENSIONS, this.extension);
  }

  get isHtml() {
    return _.includes(HTML_EXTENSIONS, this.extension);
  }

}


export default Url;
