import React from 'react';
import AppViews from './views/AppViews';
import SellerViews from './views/SellerViews';
import BuyerViews from './views/BuyerViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import {loadStdlib} from '@reach-sh/stdlib';
const reach = loadStdlib('CFX');
const { standardUnit } = reach;
const defaults = { defaultFundAmt: '100', standardUnit };


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'ConnectAccount', ...defaults};
  }

  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    this.setState({acc, bal});
    try {
      const faucet = await reach.getFaucet();
      this.setState({view: 'FundAccount', faucet});
    } catch (e) {
      console.log(this.state)
      this.setState({view: 'DeployerOrAttacher'});
    }

  }

    async fundAccount(fundAmount) {
        await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
        this.setState({ view: 'DeployerOrAttacher' });
    }
    async skipFundAccount() { this.setState({ view: 'DeployerOrAttacher' }); }

  
  selectBuyer(num) { 
    console.log(num)
    this.setState({view: 'Wrapper', ContentView: Buyer, ctcInfoStr: num});
   }
  selectSeller() { this.setState({view: 'Wrapper', ContentView: Seller}); }
  render() { return renderView(this, AppViews); }
}

class Player extends React.Component {
  random() { return reach.hasRandom.random(); }
  log(){ return reach.hasConsoleLogger.log();}



}



class Seller extends Player {
  constructor(props) {
    super(props);
    this.state = {view: 'Deploy'};
  }

  async deploy() {
    
    this.setState({ view: 'Deploying' });
    const ctc = this.props.acc.deploy(backend);
    this.deadline = { ETH: 10, ALGO: 100, CFX: 1000 }[reach.connector];
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    console.log(ctcInfoStr)
    this.setState({ view: 'WaitingForAttachers', ctcInfoStr });
    console.log('waited')
    await backend.Seller(ctc, this);
    // await pair.Seller(this.state.ctcPair, this);
}
  // setWager(wager) { this.setState({view: 'Deploy', wager}); }

  async acceptTransaction(money){
    console.log(`got ${money} USDT`)
  }

  render() { return renderView(this, SellerViews); }
}


class Buyer extends Player {
  constructor(props) {
    super(props);
    var room_num = this.props.ctcInfoStr
    console.log('roomnum: ', room_num)
    console.log(room_num)
    if (room_num === -1){
      this.state = {view: 'Attach'};
    }else{
      this.state = {view: 'Attaching'}
      this.attach(room_num.toString())
    }
  }

  attach(ctcInfoStr) {
    console.log('attach ' + ctcInfoStr)
    fetch('http://localhost:5000/get_data/' + ctcInfoStr, {
      method: 'get',
      headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
      }
    }).then(res => {
      if (res.ok){
        console.log('ok')
        return res.json();
      }else{
        alert('fail')
        return res.json()
      }
    })
    .then(data => {
      console.log(data)
      const ctc = this.props.acc.attach(backend, JSON.parse(data.data.contract));
      this.setState({view: 'Attaching', price:data.data.price});
      backend.Buyer(ctc, this);
      console.log(this.props)
    })
  }

  async getPrice(){
    return this.price;
  }

  
  render() { return renderView(this, BuyerViews); }
}

renderDOM(<App />);