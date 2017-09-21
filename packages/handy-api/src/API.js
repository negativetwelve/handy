// NOTE(mark): Need to polyfill global.self because isomorphic-fetch
// requires it.
global.self = global;

// Libraries
import Url from 'handy-url';
import fetch from 'isomorphic-fetch';


/**
 * API Client class that makes requests to a remote server.
 */
class API {

  constructor({baseUrl}) {
    this.baseUrl = baseUrl;
  }

  createUrl({method = 'GET', path, params}) {
    const url = `${this.baseUrl}${path}`;

    switch (method) {
      case 'GET':
        return new Url(url, params);
      case 'POST':
        return new Url(url);
    }
  }

  createBody({method, params, data}) {
    if (method === 'GET') {
      return;
    } else if (data) {
      return data;
    } else if (params) {
      return JSON.stringify(params);
    }
  }

  async request({method, path, headers, params, data}) {
    const url = this.createUrl({method, path, params}).toString();
    const body = this.createBody({method, params, data});

    return fetch(url, {method, headers, body});
  }

}


export default API;
