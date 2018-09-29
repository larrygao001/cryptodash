import styled, { css } from 'styled-components';
import React from 'react';

const Logo = styled.div`
  font-size: 1.5em;
`;

const ControlButton = styled.div`
  cursor: pointer;
  ${props =>
    props.active &&
    css`
      text-shadow: 0px 0px 60px #03ff03;
    `};
`;

const Bar = styled.div`
  display: grid;
  margin-bottom: 40px;
  grid-template-columns: 180px auto 100px 100px;
`;

export default function() {
  return (
    <Bar>
      <Logo>CryptoDash</Logo>
      <div />
      {!this.state.firstVisit && (
        <ControlButton
          onClick={() => {
            this.setState({ page: 'dashboard' });
          }}
          active={this.displayingDashboard()}
        >
          Dashboard
        </ControlButton>
      )}
      <ControlButton
        onClick={() => {
          this.setState({ page: 'settings' });
        }}
        active={this.displayingSettings()}
      >
        Settings
      </ControlButton>
    </Bar>
  );
}
