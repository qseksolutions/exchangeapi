import { Component, OnInit } from '@angular/core';
import * as myGlobals from './../global';
import { ExchangeService } from '../exchange.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { timer } from 'rxjs/observable/timer';
import { take, map } from 'rxjs/operators';

declare var $;

@Component({
  selector: 'app-arbi',
  templateUrl: './arbi.component.html',
  styleUrls: ['./arbi.component.css'],
  providers: [ExchangeService, DatePipe, DecimalPipe],
})
export class ArbiComponent implements OnInit {

  public base_url: any = myGlobals.base_url;
  coindata: any;
  tempcoindata: any;
  countDown: any;
  count: any = 11;
  coinlist: any;
  exchangelist: any;
  coincurr: any;
  coinsel: any;
  currsel: any;
  coincoin: any;
  exch1: any;
  exchange1: any;
  exch2: any;
  exchange2: any;
  selectedIndex: any = 1;
  showloader: any;

  constructor(private exchangeService: ExchangeService, private decimalpipe: DecimalPipe, private datePipe: DatePipe) {
    this.showloader = true;
    this.coinsel = localStorage.getItem('coincoin');
    this.coincurr = localStorage.getItem('coincurr');
    this.exch1 = localStorage.getItem('exchange1');
    this.exch2 = localStorage.getItem('exchange2');
    if (this.coinsel == null) {
      this.coinsel = 'ETH';
    }
    if (this.coincurr == null) {
      this.coincurr = 'BTC';
    } else {
      if (this.coincurr == 'BTC') {
        this.selectedIndex = 1;
      } else if (this.coincurr == 'ETH') {
        this.selectedIndex = 2;
      } else if (this.coincurr == 'USD') {
        this.selectedIndex = 3;
      } else if (this.coincurr == 'USDT') {
        this.selectedIndex = 4;
      }
    }
    if (this.exch1 == null) {
      this.exch1 = '1';
    }
    if (this.exch2 == null) {
      this.exch2 = '10';
    }
  }

  ngOnInit() {
    this.exchangeService.getcoinlist().subscribe(resData => {
      if (resData.status === true) {
        this.coinlist = resData.data;
      }
    });

    this.exchangeService.getexchangelist().subscribe(resData => {
      if (resData.status === true) {
        this.exchangelist = resData.data;
      }
    });
    setTimeout(() => {
      $('#sel_coin').select2('destroy');
      for (let i = 0; i < this.coinlist.length; i++) {
        if (this.coinlist[i]['coin_symbol'] == this.coinsel) {
          $('#sel_coin').val(this.coinlist[i]['coin_symbol']);
        }
      }
      setTimeout(() => {
        $('#sel_coin').select2();
      }, 1000);
      for (let i = 0; i < this.exchangelist.length; i++) {
        if (this.exchangelist[i]['id'] == this.exch1) {
          $('#sel_exchange').val(this.exchangelist[i]['id']);
        }
        if (this.exchangelist[i]['id'] == this.exch2) {
          $('#sel_exchange2').val(this.exchangelist[i]['id']);
        }
      }
      this.coincoin = $('#sel_coin').val();
      this.exchange1 = $('#sel_exchange').val();
      this.exchange2 = $('#sel_exchange2').val();
      this.arbitabledata();
    }, 2000);
    setInterval(() => {
      // this.realtimearbitabledata();
    }, 14000);
  }

  ngAfterViewInit() {
    $('#sel_coin').on('change', (e) => {
      this.coincoin = $(e.target).val();
      localStorage.setItem('coincoin', this.coincoin);
      this.arbitabledata();
    });
  };

  /* coinchange(value) {
    this.coincoin = value;
    localStorage.setItem('coincoin', value);
    this.arbitabledata();
  } */

  toggleClass(coin, index: number) {
    this.selectedIndex = index;
    this.coincurr = coin;
    localStorage.setItem('coincurr', coin);
    this.arbitabledata();
  }

  exchange1change(value) {
    this.exchange1 = value;
    localStorage.setItem('exchange1', value);
    this.arbitabledata();
  }
  
  exchange2change(value) {
    this.exchange2 = value;
    localStorage.setItem('exchange2', value);
    this.arbitabledata();
  }

  changeprofit(index) {
    const buy_price = $('#buy_price_' + index).val();
    const sell_price = $('#sell_price_' + index).val();
    const fee = $('#fee_' + index).val();
    const qty = $('#qty_' + index).val();
    const profit = this.decimalpipe.transform((sell_price - buy_price - fee) * qty, '1.0-6');
    $('#td_profit_' + index).html(profit);
    const feehtml = this.decimalpipe.transform(fee * qty, '1.0-8');
    $('#td_fee_' + index).html(feehtml);
  }

  realtimearbitabledata() {
    this.exchangeService.getarbi(this.coincoin, this.coincurr, this.exchange1, this.exchange2).subscribe(resData => {
      if (resData.status === true) {
        let exchange1 = resData.data.exchange1;
        let exchange2 = resData.data.exchange2;
        let temparraydata = [];
        let l = 0;
        for (let i = 0; i < exchange1.length; i++) {
          resData.data.exchange2.map(function (val, k) {
            if (exchange1[i].last > val['last']) {
              if (exchange1[i].last - val['last'] - (exchange1[i].trade_fee + val['trade_fee']) > 0) {
                temparraydata[l] = {
                  'coin': exchange1[i].coin,
                  'market_name': exchange1[i].market_name,
                  'buy_price': val['last'],
                  'buyexchange': val['exchange'],
                  'buyvolume': val['volume'],
                  'sell_price': exchange1[i].last,
                  'sellexchange': exchange1[i].exchange,
                  'sellvolume': exchange1[i].volume,
                  'fee': exchange1[i].trade_fee + val['trade_fee'],
                };
                l++;
              }
            } else {
              if (val['last'] - exchange1[i].last - (exchange1[i].trade_fee + val['trade_fee']) > 0) {
                temparraydata[l] = {
                  'coin': exchange1[i].coin,
                  'market_name': exchange1[i].market_name,
                  'buy_price': exchange1[i].last,
                  'buyexchange': exchange1[i].exchange,
                  'buyvolume': exchange1[i].volume,
                  'sell_price': val['last'],
                  'sellexchange': val['exchange'],
                  'sellvolume': val['volume'],
                  'fee': exchange1[i].trade_fee + val['trade_fee'],
                };
                l++;
              }
            }
          });
        }
        temparraydata = temparraydata.reduce(function (field, e1) {
          var matches = field.filter(function (e2) { return e1.buyexchange == e2.buyexchange && e1.sellexchange == e2.sellexchange });
          if (matches.length == 0) {
            field.push(e1);
          } return field;
        }, []);
        for (let i = 0; i < temparraydata.length; i++) {
          const old_profit = this.tempcoindata[i].sell_price - this.tempcoindata[i].buy_price - this.tempcoindata[i].fee;
          const new_profit = temparraydata[i].sell_price - temparraydata[i].buy_price - temparraydata[i].fee;
          if (old_profit < new_profit) {
            $('#tr_arbi_' + i).removeClass('coin_dump_now');
            $('#tr_arbi_' + i).removeClass('coin_dump');
            $('#tr_arbi_' + i).addClass('coin_pump_now');
            setTimeout(() => {
              $('#tr_arbi_' + i).addClass('coin_pump');
            }, 1000);
          } else if (old_profit > new_profit) {
            $('#tr_arbi_' + i).removeClass('coin_pump_now');
            $('#tr_arbi_' + i).removeClass('coin_pump');
            $('#tr_arbi_' + i).addClass('coin_dump_now');
            setTimeout(() => {
              $('#tr_arbi_' + i).addClass('coin_dump');
            }, 1000);
          }
          const qty = $('#qty_' + i).val();
          $('#td_market_name_' + i).html(temparraydata[i].market_name);
          $('#td_buyexchange_' + i).html(temparraydata[i].buyexchange);
          $('#td_buy_price_' + i).html(temparraydata[i].buy_price);
          $('#buy_price_' + i).val(temparraydata[i].buy_price);
          const buyvolume = this.decimalpipe.transform(temparraydata[i].buyvolume, '1.0-2');
          $('#td_buyvolume_' + i).html(buyvolume);
          $('#td_sellexchange_' + i).html(temparraydata[i].sellexchange);
          $('#td_sell_price_' + i).html(temparraydata[i].sell_price);
          $('#sell_price_' + i).val(temparraydata[i].sell_price);
          const sellvolume = this.decimalpipe.transform(temparraydata[i].sellvolume, '1.0-2');
          $('#td_sellvolume_' + i).html(sellvolume);
          const inputfee = this.decimalpipe.transform(temparraydata[i].fee * qty, '1.0-8');
          $('#td_fee_' + i).html(inputfee);
          $('#fee_' + i).val(temparraydata[i].fee);
          const tdprofit = this.decimalpipe.transform((temparraydata[i].sell_price - temparraydata[i].buy_price - temparraydata[i].fee) * qty, '1.0-6');
          $('#td_profit_' + i).html(tdprofit);
          const tdpercentage = this.decimalpipe.transform(((temparraydata[i].sell_price - temparraydata[i].buy_price - temparraydata[i].fee) / temparraydata[i].sell_price ) * 100, '1.0-2');
          $('#td_percentage_' + i).html(tdpercentage + '%');
        }
        this.tempcoindata = temparraydata;
        this.count = 11;
        this.countDown = timer(0, 1000).pipe(
          take(this.count),
          map(() => --this.count)
        );
      }
    });
  }

  arbitabledata() {
    this.showloader = true;
    this.exchangeService.getarbi(this.coincoin, this.coincurr, this.exchange1, this.exchange2).subscribe(resData => {
      if (resData.status === true) {
        let exchange1 = resData.data.exchange1;
        let exchange2 = resData.data.exchange2;
        let temparraydata = [];
        let l = 0;
        for (let i = 0; i < exchange1.length; i++) {
          resData.data.exchange2.map(function (val, k) {
            if (exchange1[i].last > val['last']) {
              if (exchange1[i].last - val['last'] - (exchange1[i].trade_fee + val['trade_fee']) > 0) {
                temparraydata[l] = {
                  'coin': exchange1[i].coin,
                  'market_name': exchange1[i].market_name,
                  'buy_price': val['last'],
                  'buyexchange': val['exchange'],
                  'buyvolume': val['volume'],
                  'sell_price': exchange1[i].last,
                  'sellexchange': exchange1[i].exchange,
                  'sellvolume': exchange1[i].volume,
                  'fee': exchange1[i].trade_fee + val['trade_fee'],
                };
                l++;
              }
            } else {
              if (val['last'] - exchange1[i].last - (exchange1[i].trade_fee + val['trade_fee']) > 0) {
                temparraydata[l] = {
                  'coin': exchange1[i].coin,
                  'market_name': exchange1[i].market_name,
                  'buy_price': exchange1[i].last,
                  'buyexchange': exchange1[i].exchange,
                  'buyvolume': exchange1[i].volume,
                  'sell_price': val['last'],
                  'sellexchange': val['exchange'],
                  'sellvolume': val['volume'],
                  'fee': exchange1[i].trade_fee + val['trade_fee'],
                };
                l++;
              }
            }
          });
        }
        temparraydata = temparraydata.reduce(function (field, e1) {
          var matches = field.filter(function (e2) { return e1.buyexchange == e2.buyexchange && e1.sellexchange == e2.sellexchange });
          if (matches.length == 0) {
            field.push(e1);
          } return field;
        }, []);
        this.coindata = temparraydata;
        this.tempcoindata = temparraydata;
        this.showloader = false;
        this.countDown = timer(0, 1000).pipe(
          take(this.count),
          map(() => --this.count)
        );
      } else {
        this.coindata = '';
        this.showloader = false;
        this.countDown = timer(0, 1000).pipe(
          take(this.count),
          map(() => --this.count)
        );
      }
    });
  }
}
