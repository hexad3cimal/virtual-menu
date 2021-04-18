// @flow
/**
 * Client
 * @module Client
 */
 import { ApolloClient, InMemoryCache } from '@apollo/client';


/**
 * Fetch data
 *
 * @param {string} url
 * @param {Object} options
 * @param {string} [options.method] - Request method ( GET, POST, PUT, ... ).
 * @param {string} [options.payload] - Request body.
 * @param {Object} [options.headers]
 *
 * @returns {Promise}
 */
export function request(url, options = {}){
  const config = {
    method: 'GET',
    ...options,
  };
  const error = {status : null , response: null};
  const errors = [];

  if (!url) {
    errors.push('url');
  }

  if (!config.payload && config.method !== 'GET' && config.method !== 'DELETE') {
    errors.push('payload');
  }

  if (errors.length) {
    throw  `Error! You must pass \`${errors.join('`, `')}\``;
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...config.headers,
  };

  // if (!(url.includes('/login') || url.includes('/register'))) headers.Authorization = `Bearer ${getUser().token}`;

  const params = {
    headers,
    method: config.method,
  };

  if(headers['Content-Type'] === 'multipart/form-data'){
    params.body =  config.payload;
    delete headers['Content-Type']
  }
  else if (params.method !== 'GET') {
    params.body = JSON.stringify(config.payload);
  }
 

  return fetch(url, params).then(async response => {
    const contentType = response.headers.get('content-type');

    if (response.status > 299) {
      if([401,403].includes(response.status)){ localStorage.removeItem('persist:rrsb');window.location.href ="/login";return}
      error.status = response.status;

      if (contentType && contentType.includes('application/json')) {
        error.response = await response.json();
      } else {
        error.response = await response.text();
      }

      throw error;
    } else {
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return response.text();
    }
  });
}


export const graphQlClient = (url) => {
  return new ApolloClient({
    uri: url,
    cache: new InMemoryCache()
  });
}

