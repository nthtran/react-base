import React, { PropTypes } from 'react';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import createStore from './createStore';
import DevPanel from './DevPanel';

let clientStore;

if (__CLIENT__) {
  clientStore = createStore(window.__INITIAL_STATE__);
}

class Root extends React.Component {
  static propTypes = {
    store: PropTypes.object,
    routes: PropTypes.object.isRequired,
    routerState: PropTypes.object.isRequired,
  }

  static defaultProps = {
    routerState: {},
  }

  render() {
    const { store, routes, routerState } = this.props;
    const finalStore = __CLIENT__ ? clientStore : store;
    return (
      <div>
        <Provider store={finalStore}>
          {() => <Router {...routerState} children={routes}/>}
        </Provider>
        <DevPanel store={finalStore}/>
      </div>
    );
  }
}

export default Root;