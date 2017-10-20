// Imports
import Url from '../Url';


describe('Url', () => {

  // --------------------------------------------------
  // String Representation
  // --------------------------------------------------
  describe('#toString', () => {
    it('appends protocol to relative urls', () => {
      expect(new Url('github.com').toString()).toEqual('http://github.com');
    });

    it('does not append protocol to absolute urls', () => {
      expect(new Url('https://github.com').toString()).toEqual('https://github.com');
    });
  });

  describe('#asAbsolute', () => {
    it('appends protocol to relative urls', () => {
      expect(new Url('github.com').asAbsolute()).toEqual('http://github.com');
    });

    it('does not append protocol to absolute urls', () => {
      expect(new Url('https://github.com').asAbsolute()).toEqual('https://github.com');
    });
  });

  describe('#asRelative', () => {
    it('does not append protocol to relative urls', () => {
      expect(new Url('github.com').asRelative()).toEqual('github.com');
    });

    it('removes protocol from absolute urls', () => {
      expect(new Url('https://github.com').asRelative()).toEqual('github.com');
    });
  });

  // --------------------------------------------------
  // Protocol
  // --------------------------------------------------
  describe('#protocol', () => {
    const httpProtocols = [
      'http://google.com',
      'http://a.b.com',
    ];

    httpProtocols.forEach(url => {
      it(`returns 'http' for ${url}`, () => {
        expect(new Url(url).protocol).toBe('http');
      });
    });

    const httpsProtocols = [
      'https://google.com',
      'https://www.google.com',
    ];

    httpsProtocols.forEach(url => {
      it(`returns 'https' for ${url}`, () => {
        expect(new Url(url).protocol).toBe('https');
      });
    });

    const invalidProtocols = [
      'www.google.com',
      'google.com',
      'http//google.com',
      'ftp//google.com',
      'ftp/google.com',
    ];

    invalidProtocols.forEach(url => {
      it(`returns null for ${url}`, () => {
        expect(new Url(url).protocol).toBeNull();
      });
    });
  });

  describe('#isAbsolute', () => {
    const absoluteUrls = [
      'http://google.com',
      'https://google.com',
      'http://www.google.com',
      'https://www.google.com',
    ];

    absoluteUrls.forEach(url => {
      it(`returns true for ${url}`, () => {
        expect(new Url(url).isAbsolute).toBe(true);
      });
    });

    const relativeUrls = [
      'www.google.com',
      'google.com',
    ];

    relativeUrls.forEach(url => {
      it(`returns false for ${url}`, () => {
        expect(new Url(url).isAbsolute).toBe(false);
      });
    });
  });

  describe('#isSecure', () => {
    const secureUrls = [
      'https://www.google.com',
      'https://google.com',
      'https://facebook.com',
    ];

    secureUrls.forEach(url => {
      it(`returns true for ${url}`, () => {
        expect(new Url(url).isSecure).toBe(true);
      });
    });

    const insecureUrls = [
      'http://www.google.com',
      'blahblah',
      'ftp://google.com',
      'blob://google.com',
    ];

    insecureUrls.forEach(url => {
      it(`returns false for ${url}`, () => {
        expect(new Url(url).isSecure).toBe(false);
      });
    });
  });

  // --------------------------------------------------
  // Host / Hostname
  // --------------------------------------------------
  describe('#hostname', () => {
    it('returns subdomains in the hostname', () => {
      expect(new Url('http://www.google.com').hostname).toBe('www.google.com');
    });

    it('returns all subdomains in the hostname', () => {
      expect(new Url('https://something.www.google.com').hostname).toBe('something.www.google.com');
    });
  });

  describe('#domain', () => {
    it('does not return any subdomains', () => {
      expect(new Url('https://www.google.com').domain).toBe('google');
    });

    it('does not return the tld', () => {
      expect(new Url('https://google.com').domain).toBe('google');
    });

    it('does not require a protocol but requires slashes', () => {
      expect(new Url('//www.google.com').domain).toBe('google');
    });

    it('returns the empty string for invalid urls', () => {
      expect(new Url('www.google.com').domain).toBe('');
    });
  });

  describe('#tld', () => {
    it('does not return the domain name', () => {
      expect(new Url('https://www.google.com').tld).toBe('com');
    });
  });

  // --------------------------------------------------
  // Filename
  // --------------------------------------------------
  describe('#filename', () => {
    it('parses the filename from a path', () => {
      const url = new Url('http://markmiyashita.com/downloads/mark_miyashita_resume.pdf');

      expect(url.filename).toBe('mark_miyashita_resume.pdf');
    });
  });

  describe('#fileBasename', () => {
    it('parses out the extension', () => {
      expect(new Url('my_file.pdf').fileBasename).toBe('my_file');
    });

    it('splits by period and rejoins properly', () => {
      expect(new Url('a.b.c.xls').fileBasename).toBe('a.b.c');
    });
  });

});
