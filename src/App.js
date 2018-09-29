import React, { Component } from 'react';
import './App.css';
import styled from 'styled-components';
import AppBar from './AppBar';
import CoinList from './CoinList';
import Search from './Search';
import Dashboard from './Dashboard';
import { ConfirmButton } from './Button';
import _ from 'lodash';
import fuzzy from 'fuzzy';
import moment from 'moment';

const cc = require('cryptocompare');

const AppLayout = styled.div`
  padding: 40px;
`;

const Content = styled.div``;
export const CenterDiv = styled.div`
  display: grid;
  justify-content: center;
`;

const MAX_FAVORITES = 10;
const TIME_UNITS = 10;

const checkFirstVisit = () => {
  let cryptoDashData = JSON.parse(localStorage.getItem('cryptoDash'));
  if (!cryptoDashData) {
    return {
      firstVisit: true,
      page: 'settings'
    };
  }
  let { favorites, currentFavorite } = cryptoDashData;
  return {
    favorites,
    currentFavorite
  };
};

class App extends Component {
  state = {
    page: 'dashboard',
    favorites: ['ETH', 'BTC', 'XMR', 'DOGE', 'hdsjh'],
    timeInterval: 'months',
    ...checkFirstVisit()
  };
  componentDidMount = () => {
    this.fetchHistorical();
    this.fetchCoins();
    this.fetchPrices();
  };
  validateFavorites = coinList => {
    let validatedFavorites = [];
    this.state.favorites.forEach(favorite => {
      if (coinList[favorite]) {
        validatedFavorites.push(favorite);
      }
    });
    return validatedFavorites;
  };
  fetchCoins = async () => {
    let coinList = (await cc.coinList()).Data;
    this.setState({ coinList, favorites: this.validateFavorites(coinList) });
  };
  fetchPrices = async () => {
    if (this.state.firstVisit) return;
    let prices = await this.prices();
    this.setState({ prices });
  };
  fetchHistorical = async () => {
    if (this.state.firstVisit) return;
    let results = await this.historical();
    let historical = [
      {
        name: this.state.currentFavorite,
        data: results.map((ticker, index) => [
          moment()
            .subtract({ [this.state.timeInterval]: TIME_UNITS - index })
            .valueOf(),
          ticker.USD
        ])
      }
    ];
    this.setState({ historical });
  };
  historical = () => {
    let promises = [];
    for (let units = TIME_UNITS; units > 0; units--) {
      promises.push(
        cc.priceHistorical(
          this.state.currentFavorite,
          ['USD'],
          moment()
            .subtract({ [this.state.timeInterval]: units })
            .toDate()
        )
      );
    }
    return Promise.all(promises);
  };
  prices = async () => {
    let returnData = [];
    for (let i = 0; i < this.state.favorites.length; i++) {
      try {
        let priceData = await cc.priceFull(this.state.favorites[i], 'USD');
        returnData.push(priceData);
      } catch (e) {
        console.warn('Fetch price error: ', e);
      }
    }
    return returnData;
  };
  displayingDashboard = () => this.state.page === 'dashboard';
  displayingSettings = () => this.state.page === 'settings';
  firstVisitMessage = () => {
    if (this.state.firstVisit) {
      return (
        <div>
          Welcome to CryptoDash, please select your favorite coins to begin.{' '}
        </div>
      );
    }
  };
  confirmFavorites = () => {
    let currentFavorite = this.state.favorites[0];
    this.setState(
      {
        firstVisit: false,
        page: 'dashboard',
        prices: null,
        currentFavorite,
        historical: null
      },
      () => {
        this.fetchPrices();
        this.fetchHistorical();
      }
    );
    localStorage.setItem(
      'cryptoDash',
      JSON.stringify({
        favorites: this.state.favorites,
        currentFavorite
      })
    );
  };
  settingsContent = () => {
    return (
      <div>
        {this.firstVisitMessage()}
        <div>
          {CoinList.call(this, true)}
          <CenterDiv>
            <ConfirmButton onClick={this.confirmFavorites}>
              Confirm Favorites
            </ConfirmButton>
          </CenterDiv>
          {Search.call(this)}
          {CoinList.call(this)}
        </div>
      </div>
    );
  };
  loadingContent = () => {
    if (!this.state.coinList) {
      return <div> Loading Coins </div>;
    }
    if (!this.state.firstVisit && !this.state.prices) {
      return <div> Loading Prices </div>;
    }
  };
  addCoinToFavorites = key => {
    let favorites = [...this.state.favorites];
    if (favorites.length < MAX_FAVORITES) {
      favorites.push(key);
      this.setState({ favorites });
    }
  };
  removeCoinFromFavorites = key => {
    let favorites = [...this.state.favorites];
    this.setState({ favorites: _.pull(favorites, key) });
  };
  isInFavorites = key => _.includes(this.state.favorites, key);
  handleFilter = _.debounce(inputValue => {
    // Get all the coin symbols
    let coinSymbols = Object.keys(this.state.coinList);
    // Get all the coin names, maps symbol to name
    let coinNames = coinSymbols.map(sym => this.state.coinList[sym].CoinName);
    let allStringsToSearch = coinSymbols.concat(coinNames);
    let fuzzyResults = fuzzy
      .filter(inputValue, allStringsToSearch, {})
      .map(result => result.string);

    let filteredCoins = _.pickBy(this.state.coinList, (result, symKey) => {
      let coinName = result.CoinName;
      // If our fuzzy results contains this symbol OR the coinName, include it (return true).
      return (
        _.includes(fuzzyResults, symKey) || _.includes(fuzzyResults, coinName)
      );
    });

    this.setState({ filteredCoins });
  }, 500);
  filterCoins = e => {
    let inputValue = _.get(e, 'target.value');
    if (!inputValue) {
      this.setState({
        filteredCoins: null
      });
      return;
    }
    this.handleFilter(inputValue);
  };
  render() {
    return (
      <AppLayout>
        {AppBar.call(this)}
        {this.loadingContent() || (
          <Content>
            {this.displayingSettings() && this.settingsContent()}
            {this.displayingDashboard() && Dashboard.call(this)}
          </Content>
        )}
      </AppLayout>
    );
  }
}

export default App;
