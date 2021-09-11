import React from 'react';
import AppViews from './views/AppViews';
import BuyerViews from './views/BuyerViews';
import SellerViews from './views/SellerViews';
import {renderDOM,renderView } from './views/render';
import './index.css';
import * as index from './build/index.main.mjs';
import { loadStdlib } from '@reach-sh/stdlib';
const reach = loadStdlib('CFX');
const { standardUnit } = reach;
const defaults = { defaultFundAmt: '100', standardUnit };


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { view: 'ConnectAccount', ...defaults };
    }
    async componentDidMount() {
        const acc = await reach.getDefaultAccount();
        const balAtomic = await reach.balanceOf(acc);
        const bal = reach.formatCurrency(balAtomic, 4);
        this.setState({ acc, bal });
        try {
            const faucet = await reach.getFaucet();
            this.setState({ view: 'FundAccount', faucet });
        } catch (e) {
            this.setState({ view: 'DeployerOrAttacher' });
        }
    }
    async fundAccount(fundAmount) {
        await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
        this.setState({ view: 'DeployerOrAttacher' });
    }
    async skipFundAccount() { this.setState({ view: 'DeployerOrAttacher' }); }


    selectSeller() { this.setState({ view: 'Wrapper', ContentView: Seller }); }
    selectBuyer() { this.setState({ view: 'Wrapper', ContentView: Buyer }); }

    render() { return renderView(this, AppViews); }
}


class Player extends React.Component {
    random() { return reach.hasRandom.random(); }
    informTimeout() { this.setState({ view: 'Timeout' }); }
    waiting() { this.setState({ view: 'Waiting' }) }
    goodbye() { this.setState({ view: 'Done' }) }
}


class Seller extends React.Component {
    constructor(props) {
        super(props);
        this.state = { view: 'Deploy' };
    }


    async acceptTransaction(money) {
        console.log(`got ${money} USDT`)
    }

    async deploy() {
        const ctcBuy= this.props.acc.deploy(index)
        this.setState({ view: 'Deploying' });

        this.deadline = { ETH: 10, ALGO: 100, CFX: 2000 }[reach.connector];
        console.log('deadline')
        const info = await ctcBuy.getInfo()
        console.log('info')
        const ctcInfoStr = JSON.stringify(info, null, 2);
        console.log(ctcInfoStr)
        this.setState({ view: 'WaitingForAttachers', ctcInfoStr });
        console.log('got it')
        await index.Seller(this.state.ctcBuy, this);
        // await pair.Seller(this.state.ctcPair, this);
    }


    render() { return renderView(this, SellerViews); }
}

//=============================================================================================


class Buyer extends Player {
    constructor(props) {
        super(props);
        this.state = { view: 'Attach' };
    }
    async attach(ctcInfoStr) {
        const ctc = this.props.acc.attach(index, JSON.parse(ctcInfoStr));
        this.setState({ view: 'Attaching' });
        await index.Buyer(ctc, this);
    }

    async getPrice() {
        return this.price;
    }

    render() { return renderView(this, BuyerViews); }
}



renderDOM(<App />);