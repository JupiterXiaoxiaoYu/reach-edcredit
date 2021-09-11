'reach 0.1';



export const main = Reach.App(() => {
  
  const Player = {
    printTransactionDetail: Fun([], Null),
    // informTimeout: Fun([], Null),
  };

    const Buyer = Participant('Buyer', {
        ...Player,
        getPrice:Fun([],UInt),
      });
    const Seller = Participant('Seller', {
       ...Player,
       acceptTransaction: Fun([UInt], Null),
    });
  
    deploy();

    Buyer.only(() => {
    const transactionAmount = declassify(interact.getPrice());
    });
    Buyer.publish(transactionAmount)
      .pay(transactionAmount);

    commit();

    Seller.only(() => {
      interact.acceptTransaction(transactionAmount);
    });
    Seller.publish();
    transfer(transactionAmount).to(Seller);

    commit();

    each([Buyer, Seller], () => {
      interact.printTransactionDetail();
    }
    );

    exit()
});