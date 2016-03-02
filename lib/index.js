var uri = require('url')
  , request = require('request');


module.exports = function(options) {
  options = options || {};
  
  // Optionally inject `request`-compatible module.
  request = options.request || request;
  
  
  return function oauth2ClientConfiguration(id, cb) {
    var base = id;
    if (base[base.length - 1] != '/') { base = base + '/'; }

    url = uri.resolve(base, '.well-known/oauth2-client-configuration');
    request.get(url, {
      headers: {
        'Accept': 'application/json'
      }
    }, function handle(err, res, body) {
      if (err) { return cb(err); }
      if (res.statusCode == 404) {
        // OAuth 2.0 client configuration not supported by this entity.  Invoke
        // callback without an error or metadata.  If additional mechanisms are
        // supported, attempts to retrieve metadata will continue.
        return cb();
      }
      if (res.statusCode != 200) {
        return cb(new Error('Unexpected response status ' + res.statusCode + ' from ' + url));
      }

      var config;
      try {
        config = JSON.parse(body);
      } catch (ex) {
        return cb(new Error('Failed to parse OAuth 2.0 client configuration from ' + url));
      }
    
      // TODO: resolve any relative URLs
      
      var client = {};
      client.id = id;
      client.name = config.client_name;
      client.redirectURIs = config.redirect_uris;
      // In contrast to RFC 7591, which defaults `token_endpoint_auth_method` to
      // `client_secret_basic`, the default for federated clients is `none`.
      // This is due to the fact that there is no secure channel by which to
      // convey a shared secret between the authorizations server and they
      // unregistered, federated client.  As a consequence, federated clients
      // are treated as public clients, absent any additional PKI support.
      client.tokenEndpointAuthMethod = config.token_endpoint_auth_method || 'none';
      client.grantTypes = config.grant_types || [ 'authorization_code' ];
      client.responseTypes = config.response_types || [ 'code' ];
      client.uri = config.client_uri;
      client.logoURI = config.logo_uri;
      
      // TODO: parse additional metadata
      
      return cb(null, client);
    });
  }
}
