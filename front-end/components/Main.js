import { FaAngleRight } from "react-icons/fa6";
import React, { useEffect } from 'react';

export default function Main() {
    useEffect(() => {
        const icons = document.querySelectorAll('.fa');
    
        const animateIcons = (index) => {
            if (index < icons.length) {
              icons[index].classList.add('animated');
              setTimeout(() => {
                icons[index].classList.remove('animated');
                animateIcons(index + 1);
              }, 300);
            }
          };
      
          animateIcons(0);
      
          // Повторюємо анімацію безкінечно
          const intervalId = setInterval(() => animateIcons(0), 2000);
      
          // Очищаємо інтервал при виході з компонента
          return () => clearInterval(intervalId);
        }, []);
    
    return (
        <section className="main">
            <div className="chain"><img className="attention" src="/img/attention.png"></img>Please connect to a Blast testnet chain </div>
            <h1 className="slogan"> Fun In Every Flip </h1>
            <div className="main-content">
                <div className="main-txt">
                    <p className="speed">With every toss, roll, or flip</p>
                    <p className="info">FlipFlop offers a unique and entertaining experience
                     where luck meets blockchain, and winners are rewarded in the exciting realm
                      of digital currency.</p>
                </div>
                <img className="coins" src="/img/coins.png"></img>
            </div>
            <div className="prize">
                <div className="box-text">EXTRA TICKETS FOR ALL STAKERS<br /> ONCE A WEEK</div>
                <img src="/img/box.png"></img>
                <div className="box-explain">Get +1 free ticket for every week of staking!<br /> Grab your chance to try your extra luck</div>
            </div>
            <div className="cards">
                <div className="card">
                    <img className="card-img card-img-eth" src="/img/eth.png"></img>
                    <div className="card-txt">Stake<br /> Your ETH</div>
                </div>
                <span className="fa fa-sm"><FaAngleRight /></span>
                <span className="fa fa-big"><FaAngleRight /></span>
                <span className="fa fa-sm"><FaAngleRight /></span>
                <div className="card">
                    <img className="card-img card-img-ticket" src="/img/ticket.png"></img>
                    <div className="card-txt">Earn Extra<br /> Tickets</div>
                </div>
                <span className="fa fa-sm"><FaAngleRight /></span>
                <span className="fa fa-big"><FaAngleRight /></span>
                <span className="fa fa-sm"><FaAngleRight /></span>
                <div className="card">
                    <img className="card-img card-img-prize" src="/img/prize.png"></img>
                    <div className="card-txt">Increase<br />  Your Chances</div>
                </div>
            </div>
        </section>
    )
}
 