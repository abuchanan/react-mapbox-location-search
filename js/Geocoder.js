import MapboxClient from 'mapbox';


class Request {
  constructor(client, cache, callback, query) {
    this.canceled = false;

    client.geocodeForward(query, (error, results) => {
      if (this.canceled) {
        return;
      }

      if (error) {
        callback('error', error);
        return;
      }

      cache.set(query, results);
      callback('results', results);
    });
  }
}


class Geocoder {

  constructor(Mapbox_access_key, callback) {
    this.min_query_length = 3;
    this.debounce_time = 300; // milliseconds
    this._callback = callback;
    this._client = new MapboxClient(Mapbox_access_key);
    this._current_request = null;
    this._cache = new Map();
  }

  _do_query(query) {
    if (this._current_request) {
      this._current_request.canceled = true;
    }

    query = query.toLowerCase();

    if (this._cache.has(query)) {
      this._callback('results', cache.get(query));
    } else {
      this._current_request = new Request(this._client, this._cache,
                                          this._callback, query);
      this._callback('loading');
    }
  }

  /*
    There are lots of cases where there might be many queries in a short time,
    such as the user typing in a location search box, so wait until no queries
    have arrive for {this.debounce_time} before sending a request.
  */
  _queue(query) {
      clearTimeout(this._debounce_timeout);
      this._debounce_timeout = setTimeout(() => {
        this._do_query(query);
      }, this.debounce_time);
  }

  geocodeForward(query) {
    if (query.length < this.min_query_length) {
      this._callback('query too short');
    } else {
      this._queue(query);
    }
  }

  clear() {
    if (this._current_request) {
      this._current_request.canceled = true;
    }
    clearTimeout(this._debounce_timeout);
    this._callback('cleared');
  }
}

export default Geocoder;
