import React from 'react';
import PlayerViews from './PlayerViews';

const exports = { ...PlayerViews };

exports.Wrapper = class extends React.Component {
  render() {
    const { content } = this.props;
    return (
      <div className="FirBuyer">
        <h2>玩家一</h2>
        {content}
      </div>
    );
  }
}


exports.Attach = class extends React.Component {
  render() {
    const {parent} = this.props;
    const {ctcInfoStr} = this.state || {};
    return (
      <div>
         请问您要加入星空之缘系列合约吗? 请粘贴合约信息:
        <br />
        <textarea spellCheck="false"
          className='ContractInfo'
          onChange={(e) => this.setState({ctcInfoStr: e.currentTarget.value})}
          placeholder='{}'
        />
        <br />
        <button
          disabled={!ctcInfoStr}
          onClick={() => parent.attachBuy(ctcInfoStr)}
        >加入星空之缘星座占卜DAPP</button>
      </div>
    );
  }
}


exports.Attaching = class extends React.Component {
  render() {
    return (
      <div>
        正在加入，请稍后
      </div>
    );
  }
}







export default exports;