import React from 'react';
import buildClassNames from 'classnames';
import Geocoder from './Geocoder';

const LocationSearch = React.createClass({

  contextTypes: {
    actions: React.PropTypes.object,
  },

  getInitialState() {
    return {
      resultsState: "cleared",
      results: [],
      highlighted: 0,
      value: ""
    };
  },

  componentDidMount() {
    let key = this.props.Mapbox_access_key;

    this.geocoder = new Geocoder(key, (state, results) => {

      if (state == "error") {
        console.error("Error with geocode request", results);
        this.setState({
          resultsState: "no results",
          results: [],
        });

      } else if (state == "query too short") {
        this.setState({
          resultsState: "cleared",
          results: [],
        });

      } else if (state == "cleared") {
        this.setState({
          resultsState: "cleared",
          results: [],
        });

      } else if (state == "loading") {
        this.setState({
          resultsState: "loading",
          results: [],
        });

      } else if (state == "results") {

        if (results.features.length > 0) {
          this.setState({
            resultsState: "results",
            results: results.features,
          });

        } else {
          this.setState({
            resultsState: "no results",
            results: [],
          });
        }
      }
    });
  },

  onBlur() {
    this.geocoder.clear();
  },

  highlight(idx) {
    this.setState({
      highlighted: idx
    });
  },

  select_result(result) {
    this.props.onResultSelected(result);
    this.geocoder.clear();
    this.setState({
      value: result.place_name
    });
  },

  handle_change(e) {
    var value = e.target.value;

    this.setState({
      value,
    });
    this.geocoder.geocodeForward(value);
  },

  render() {
    var results;
    var resultsState = this.state.resultsState;

    if (resultsState == "cleared") {
      results = "";

    } else if (resultsState == "results") {
      results = (
        <ul className='location-search-results' role="listbox">
          {this.state.results.map((result, idx) => {
            return (
              <li role="option" key={result.id}>
                <Result
                  idx={idx}
                  onMouseOver={e => this.highlight(idx)}
                  onMouseDown={e => this.select_result(result)}
                  highlighted={idx == this.state.highlighted}
                  result={result}
                />
              </li>
            );
          })}
        </ul>
      );

    } else if (resultsState == "loading") {
      results = (
        <div className='location-search-loading'>Loading</div>
      );

    } else if (resultsState == "no results") {
      results = (
        <div className='location-search-no-results'>No results</div>
      );
    }

    return (
      <div>
        <input
          autoFocus={false}
          autoComplete={false}
          placeholder="Search"
          value={this.state.value}

          onChange={this.handle_change}
          onBlur={this.onBlur}

          role="combobox"
          aria-autocomplete="list"
          aria-owns="location-search-results"
          aria-expanded={resultsState == "show"}
        />
        {results}
      </div>
    );
  }
});

const Result = props => {
  var {result, highlighted, ...other} = props;
  var classNames = buildClassNames("location-search-result", {highlighted});

  return (
    <div className={classNames} {...other}>{result.place_name}</div>
  );
};

export default LocationSearch;
