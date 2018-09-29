import React from 'react';
import styled from 'styled-components';
import { backgroundColor2, fontSize2 } from './Style';

const SearchContainer = styled.div`
  margin-top: 40px;
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-gap: 20px;
`;

const SearchInput = styled.input`
  ${backgroundColor2} 
  color: #1163c9;
  border: 1px solid;
  ${fontSize2} 
  margin: 5px;
  height: 25px;
  place-self: center left;
`;

export default function() {
  return (
    <SearchContainer>
      <h2> Search all coins </h2>
      <SearchInput onKeyUp={this.filterCoins} />
    </SearchContainer>
  );
}
