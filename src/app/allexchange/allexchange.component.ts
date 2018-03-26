import { Component, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import * as myGlobals from './../global';
import { ExchangeService } from '../exchange.service';
import { DecimalPipe } from '@angular/common';
import { timer } from 'rxjs/observable/timer';
import { take, map } from 'rxjs/operators';

declare var $;

@Component({
  selector: 'app-allexchange',
  templateUrl: './allexchange.component.html',
  styleUrls: ['./allexchange.component.css'],
  providers: [ExchangeService, DecimalPipe],
})
export class AllexchangeComponent implements OnInit {

  public base_url: any = myGlobals.base_url;
  countDown: any;
  count: any = 11;
  tcoin: any;
  result: any;
  tempresult: any;
  allresult: any;
  tempallresult: any;
  keydata: any = -1;
  tempkeydata: any = -1;
  class: any;
  currcoin: any = '';
  exchange: any[] = [];
  newData: any[] = [];
  datachange: any;
  changedata: any;
  /* datachange = {
    last: '',
  }; */
  exchangeName: any = 'BTC';
  filter: any = 'coin';
  selectedIndex: any = 1;
  selectedTable: any = 1;
  selectedTime: any = 3;
  selectedColumn: any = 1;
  showloader: any;
  showtable: any;
  period: any = '24h';
  exchangelist: any;
  coinexch: any;

  constructor(private exchangeService: ExchangeService, private router: Router, private http: Http, private decimalpipe: DecimalPipe) { }

  toggleClass(coin, index: number, table: number) {
    this.selectedIndex = index;
    this.exchangeName = coin;
    if (table === 1) {
      this.getCoinTableData(this.exchangeName);
    } else if (table === 2) {
      this.getExchangeTableData(this.exchangeName);
    }
  }

  toggleTime(time, index: number, table: number) {
    this.selectedTime = index;
    this.period = time;
    if (table === 1) {
      this.getCoinTableData(this.exchangeName);
    } else if (table === 2) {
      this.getExchangeTableData(this.exchangeName);
    }
  }

  changeTable(table: number, filter, data) {
    this.filter = filter;
    $('#filter-menu').html(data);
    if (filter === 'coin') {
      this.getCoinTableData(this.exchangeName);
    } else if (filter === 'exchange') {
      this.getExchangeTableData(this.exchangeName);
    }
    this.selectedTable = table;
  }

  changeColumn(index: number, column) {
    this.selectedColumn = index;
    $('#filter-menu1').html(column);
  }

  exchangechange(value) {
    this.coinexch = value;
    if (this.selectedTable === 1) {
      this.getCoinTableData(this.exchangeName);
    } else if (this.selectedTable === 2) {
      this.getExchangeTableData(this.exchangeName);
    }
  }

  ngOnInit() {
    this.exchangeService.getexchangelist().subscribe(resData => {
      if (resData.status === true) {
        this.exchangelist = resData.data;
      }
    });
    setTimeout(() => {
      this.exchangelist.map(function (val, key) {
        if (val['ex_id'] === 'bittrex') {
          $('#sel_exchange').val(val['ex_id']);
        }
      });
      this.coinexch = $('#sel_exchange').val();
      this.getCoinTableData(this.exchangeName);
    }, 2000);
    setInterval(() => {
      if (this.selectedTable === 1) {
        this.realtimeCoingetabledata(this.exchangeName);
      } else if (this.selectedTable === 2) {
        this.realtimeExchangetabledata(this.exchangeName);
      }
    }, 14000);
  }

  realtimeExchangetabledata(coin) {
    this.exchangeService.getAllExchange(this.coinexch, this.filter, coin).subscribe(resData => {
      if (resData.status === true) {
        // this.result = resData.data;
        this.exchangeService.changedata(this.period, this.coinexch).subscribe(res => {
          if (res.status === true) {
            this.changedata = res.data;
            for (let i = 0; i < res.data.length; i++) {
              resData.data.map(function (val, j) {
                if (res.data[i]['pair'] === val['market_name'] && res.data[i]['exchange'] == val['exchange']) {
                  val['volume'] = res.data[i]['volume'];
                  val['base_volume'] = res.data[i]['basevolume'];
                  val['high'] = res.data[i]['high'];
                  val['low'] = res.data[i]['low'];
                  val['prev_day'] = res.data[i]['first'];
                }
              });
            }
            let temparraydata = [];
            let tempnamenew = '';
            let l = -1;
            let j = 0;
            resData.data.map(function (val, i) {
              if (tempnamenew !== val['exchange']) {
                j = 0;
                l++;
                tempnamenew = val['exchange'];
                temparraydata[l] = { 'ms_id': val['ms_id'], 'exchange': val['exchange'], 'coindata': [val] };
              } else {
                j++;
                temparraydata[l]['coindata'][j] = val;
              }
            });
            resData.data = temparraydata;
            for (let i = 0; i < resData.data.length; i++) {
              for (let j = 0; j < resData.data[i].coindata.length; j++) {
                if (this.tempallresult[i].coindata[j].last < resData.data[i].coindata[j].last) {
                  $('#tr_exchange_' + resData.data[i].ms_id).removeClass('coin_dump_now');
                  $('#tr_exchange_' + resData.data[i].ms_id).removeClass('coin_dump');
                  $('#tr_exchange_' + resData.data[i].ms_id).addClass('coin_pump_now');
                  setTimeout(() => {
                    $('#tr_exchange_' + resData.data[i].ms_id).addClass('coin_pump');
                  }, 1000);
                } else if (this.tempallresult[i].coindata[j].last > resData.data[i].coindata[j].last) {
                  $('#tr_exchange_' + resData.data[i].ms_id).removeClass('coin_pump_now');
                  $('#tr_exchange_' + resData.data[i].ms_id).removeClass('coin_pump');
                  $('#tr_exchange_' + resData.data[i].ms_id).addClass('coin_dump_now');
                  setTimeout(() => {
                    $('#tr_exchange_' + resData.data[i].ms_id).addClass('coin_dump');
                  }, 1000);
                }
                const exch_last_price = this.decimalpipe.transform(resData.data[i].coindata[j].last, '1.0-8');
                $('#exch_last_' + resData.data[i].coindata[j].ms_id).html(exch_last_price);
                const change = ((resData.data[i].coindata[j].last - resData.data[i].coindata[j].prev_day) / resData.data[i].coindata[j].last) * 100;
                const change_num = this.decimalpipe.transform(change, '1.0-2');
                if (change > 0) {
                  this.class = 'green';
                } else {
                  this.class = 'red';
                }
                $('#exch_change_' + resData.data[i].coindata[j].ms_id).addClass(this.class);
                $('#exch_change_' + resData.data[i].coindata[j].ms_id).html(change_num + '%');
                const exch_bid_price = this.decimalpipe.transform(resData.data[i].coindata[j].bid, '1.0-8');
                $('#exch_bid_' + resData.data[i].coindata[j].ms_id).html(exch_bid_price);
                const exch_ask_price = this.decimalpipe.transform(resData.data[i].coindata[j].ask, '1.0-8');
                $('#exch_ask_' + resData.data[i].coindata[j].ms_id).html(exch_ask_price);
                if (this.selectedColumn === 1) {
                  const vol_data = this.decimalpipe.transform(resData.data[i].coindata[j].volume, '1.0-2');
                  $('#exch_volumn_' + resData.data[i].coindata[j].ms_id).html(vol_data);
                } else {
                  const base_vol_data = this.decimalpipe.transform(resData.data[i].coindata[j].base_volume, '1.0-2');
                  $('#exch_base_volumn_' + resData.data[i].coindata[j].ms_id).html(base_vol_data);
                }
                const exch_low_price = this.decimalpipe.transform(resData.data[i].coindata[j].low, '1.0-8');
                $('#exch_low_' + resData.data[i].coindata[j].ms_id).html(exch_low_price);
                const exch_high_price = this.decimalpipe.transform(resData.data[i].coindata[j].high, '1.0-8');
                $('#exch_high_' + resData.data[i].coindata[j].ms_id).html(exch_high_price);
                $('#exch_order_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].open_buy_orders);
                $('#exch_sell_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].open_sell_orders);
                $('#exch_confirm_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].min_confirm);
                $('#exch_fee_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].transaction_fee);
              }
            }
            this.count = 11;
            this.countDown = timer(0, 1000).pipe(
              take(this.count),
              map(() => --this.count)
            );
            this.tempallresult = resData.data;
          } else {
            let temparraydata = [];
            let tempnamenew = '';
            let l = -1;
            let j = 0;
            resData.data.map(function (val, i) {
              if (tempnamenew !== val['exchange']) {
                j = 0;
                l++;
                tempnamenew = val['exchange'];
                temparraydata[l] = { 'ms_id': val['ms_id'], 'exchange': val['exchange'], 'coindata': [val] };
              } else {
                j++;
                temparraydata[l]['coindata'][j] = val;
              }
            });
            resData.data = temparraydata;
            for (let i = 0; i < resData.data.length; i++) {
              for (let j = 0; j < resData.data[i].coindata.length; j++) {
                if (this.tempallresult[i].coindata[j].last < resData.data[i].coindata[j].last) {
                  $('#tr_exchange_' + resData.data[i].ms_id).removeClass('coin_dump_now');
                  $('#tr_exchange_' + resData.data[i].ms_id).removeClass('coin_dump');
                  $('#tr_exchange_' + resData.data[i].ms_id).addClass('coin_pump_now');
                  setTimeout(() => {
                    $('#tr_exchange_' + resData.data[i].ms_id).addClass('coin_pump');
                  }, 1000);
                } else if (this.tempallresult[i].coindata[j].last > resData.data[i].coindata[j].last) {
                  $('#tr_exchange_' + resData.data[i].ms_id).removeClass('coin_pump_now');
                  $('#tr_exchange_' + resData.data[i].ms_id).removeClass('coin_pump');
                  $('#tr_exchange_' + resData.data[i].ms_id).addClass('coin_dump_now');
                  setTimeout(() => {
                    $('#tr_exchange_' + resData.data[i].ms_id).addClass('coin_dump');
                  }, 1000);
                }
                const exch_last_price = this.decimalpipe.transform(resData.data[i].coindata[j].last, '1.0-8');
                $('#exch_last_' + resData.data[i].coindata[j].ms_id).html(exch_last_price);
                const change = ((resData.data[i].coindata[j].last - resData.data[i].coindata[j].prev_day) / resData.data[i].coindata[j].last) * 100;
                const change_num = this.decimalpipe.transform(change, '1.0-2');
                if (change > 0) {
                  this.class = 'green';
                } else {
                  this.class = 'red';
                }
                $('#exch_change_' + resData.data[i].coindata[j].ms_id).addClass(this.class);
                $('#exch_change_' + resData.data[i].coindata[j].ms_id).html(change_num + '%');
                const exch_bid_price = this.decimalpipe.transform(resData.data[i].coindata[j].bid, '1.0-8');
                $('#exch_bid_' + resData.data[i].coindata[j].ms_id).html(exch_bid_price);
                const exch_ask_price = this.decimalpipe.transform(resData.data[i].coindata[j].ask, '1.0-8');
                $('#exch_ask_' + resData.data[i].coindata[j].ms_id).html(exch_ask_price);
                if (this.selectedColumn === 1) {
                  const vol_data = this.decimalpipe.transform(resData.data[i].coindata[j].volume, '1.0-2');
                  $('#exch_volumn_' + resData.data[i].coindata[j].ms_id).html(vol_data);
                } else {
                  const base_vol_data = this.decimalpipe.transform(resData.data[i].coindata[j].base_volume, '1.0-2');
                  $('#exch_base_volumn_' + resData.data[i].coindata[j].ms_id).html(base_vol_data);
                }
                const exch_low_price = this.decimalpipe.transform(resData.data[i].coindata[j].low, '1.0-8');
                $('#exch_low_' + resData.data[i].coindata[j].ms_id).html(exch_low_price);
                const exch_high_price = this.decimalpipe.transform(resData.data[i].coindata[j].high, '1.0-8');
                $('#exch_high_' + resData.data[i].coindata[j].ms_id).html(exch_high_price);
                $('#exch_order_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].open_buy_orders);
                $('#exch_sell_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].open_sell_orders);
                $('#exch_confirm_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].min_confirm);
                $('#exch_fee_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].transaction_fee);
              }
            }
            this.count = 11;
            this.countDown = timer(0, 1000).pipe(
              take(this.count),
              map(() => --this.count)
            );
            this.tempallresult = resData.data;
          }
        });
      }
    });
  }

  realtimeCoingetabledata(coin) {
    this.exchangeService.getAllExchange(this.coinexch, this.filter, coin).subscribe(resData => {
      if (resData.status === true) {
        // this.result = resData.data;
        this.exchangeService.changedata(this.period, this.coinexch).subscribe(res => {
          if (res.status === true) {
            this.changedata = res.data;
            for (let i = 0; i < res.data.length; i++) {
              resData.data.map(function (val, j) {
                if (res.data[i]['pair'] === val['market_name'] && res.data[i]['exchange'] == val['exchange']) {
                  val['volume'] = res.data[i]['volume'];
                  val['base_volume'] = res.data[i]['basevolume'];
                  val['high'] = res.data[i]['high'];
                  val['low'] = res.data[i]['low'];
                  val['prev_day'] = res.data[i]['first'];
                }
              });
            }
            let temparray = [];
            let tempname = '';
            let l = -1;
            let j = 0;
            resData.data.map(function (val, i) {
              if (tempname !== val['market_name']) {
                j = 0;
                l++;
                tempname = val['market_name'];
                temparray[l] = { 'ms_id': val['ms_id'], 'coin': val['market_name'], 'coindata': [val] };
              } else {
                j++;
                temparray[l]['coindata'][j] = val;
              }
            });
            resData.data = temparray;
            for (let i = 0; i < resData.data.length; i++) {
              for (let j = 0; j < resData.data[i].coindata.length; j++) {
                if (this.tempresult[i].coindata[j].last < resData.data[i].coindata[j].last) {
                  $('#tr_coin_' + resData.data[i].ms_id).removeClass('coin_dump_now');
                  $('#tr_coin_' + resData.data[i].ms_id).removeClass('coin_dump');
                  $('#tr_coin_' + resData.data[i].ms_id).addClass('coin_pump_now');
                  setTimeout(() => {
                    $('#tr_coin_' + resData.data[i].ms_id).addClass('coin_pump');
                  }, 1000);
                } else if (this.tempresult[i].coindata[j].last > resData.data[i].coindata[j].last) {
                  $('#tr_coin_' + resData.data[i].ms_id).removeClass('coin_pump_now');
                  $('#tr_coin_' + resData.data[i].ms_id).removeClass('coin_pump');
                  $('#tr_coin_' + resData.data[i].ms_id).addClass('coin_dump_now');
                  setTimeout(() => {
                    $('#tr_coin_' + resData.data[i].ms_id).addClass('coin_dump');
                  }, 1000);
                }
                const coin_last_price = this.decimalpipe.transform(resData.data[i].coindata[j].last, '1.0-8');
                $('#coin_last_' + resData.data[i].coindata[j].ms_id).html(coin_last_price);
                const change = ((resData.data[i].coindata[j].last - resData.data[i].coindata[j].prev_day) / resData.data[i].coindata[j].last) * 100;
                const change_num = this.decimalpipe.transform(change, '1.0-2');
                if (change > 0) {
                  this.class = 'green';
                } else {
                  this.class = 'red';
                }
                $('#coin_change_' + resData.data[i].coindata[j].ms_id).addClass(this.class);
                $('#coin_change_' + resData.data[i].coindata[j].ms_id).html(change_num + '%');
                const coin_bid_price = this.decimalpipe.transform(resData.data[i].coindata[j].bid, '1.0-8');
                $('#coin_bid_' + resData.data[i].coindata[j].ms_id).html(coin_bid_price);
                const coin_ask_price = this.decimalpipe.transform(resData.data[i].coindata[j].ask, '1.0-8');
                $('#coin_ask_' + resData.data[i].coindata[j].ms_id).html(coin_ask_price);
                if (this.selectedColumn === 1) {
                  const vol_data = this.decimalpipe.transform(resData.data[i].coindata[j].volume, '1.0-2');
                  $('#coin_volumn_' + resData.data[i].coindata[j].ms_id).html(vol_data);
                } else {
                  const base_vol_data = this.decimalpipe.transform(resData.data[i].coindata[j].base_volume, '1.0-2');
                  $('#base_volumn_' + resData.data[i].coindata[j].ms_id).html(base_vol_data);
                }
                const coin_low_price = this.decimalpipe.transform(resData.data[i].coindata[j].low, '1.0-8');
                $('#coin_low_' + resData.data[i].coindata[j].ms_id).html(coin_low_price);
                const coin_high_price = this.decimalpipe.transform(resData.data[i].coindata[j].high, '1.0-8');
                $('#coin_high_' + resData.data[i].coindata[j].ms_id).html(coin_high_price);
                $('#coin_order_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].open_buy_orders);
                $('#coin_sell_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].open_sell_orders);
                $('#coin_confirm_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].min_confirm);
                $('#coin_fee_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].transaction_fee);
              }
            }
            this.count = 11;
            this.countDown = timer(0, 1000).pipe(
              take(this.count),
              map(() => --this.count)
            );
            this.tempresult = resData.data;
          } else {
            let temparray = [];
            let tempname = '';
            let l = -1;
            let j = 0;
            resData.data.map(function (val, i) {
              if (tempname !== val['market_name']) {
                j = 0;
                l++;
                tempname = val['market_name'];
                temparray[l] = { 'ms_id': val['ms_id'], 'coin': val['market_name'], 'coindata': [val] };
              } else {
                j++;
                temparray[l]['coindata'][j] = val;
              }
            });
            resData.data = temparray;
            for (let i = 0; i < resData.data.length; i++) {
              for (let j = 0; j < resData.data[i].coindata.length; j++) {
                if (this.tempresult[i].coindata[j].last < resData.data[i].coindata[j].last) {
                  $('#tr_coin_' + resData.data[i].ms_id).removeClass('coin_dump_now');
                  $('#tr_coin_' + resData.data[i].ms_id).removeClass('coin_dump');
                  $('#tr_coin_' + resData.data[i].ms_id).addClass('coin_pump_now');
                  setTimeout(() => {
                    $('#tr_coin_' + resData.data[i].ms_id).addClass('coin_pump');
                  }, 1000);
                } else if (this.tempresult[i].last > resData.data[i].last) {
                  $('#tr_coin_' + resData.data[i].ms_id).removeClass('coin_pump_now');
                  $('#tr_coin_' + resData.data[i].ms_id).removeClass('coin_pump');
                  $('#tr_coin_' + resData.data[i].ms_id).addClass('coin_dump_now');
                  setTimeout(() => {
                    $('#tr_coin_' + resData.data[i].ms_id).addClass('coin_dump');
                  }, 1000);
                }
                const coin_last_price = this.decimalpipe.transform(resData.data[i].coindata[j].last, '1.0-8');
                $('#coin_last_' + resData.data[i].coindata[j].ms_id).html(coin_last_price);
                const change = ((resData.data[i].coindata[j].last - resData.data[i].coindata[j].prev_day) / resData.data[i].coindata[j].last) * 100;
                const change_num = this.decimalpipe.transform(change, '1.0-2');
                if (change > 0) {
                  this.class = 'green';
                } else {
                  this.class = 'red';
                }
                $('#coin_change_' + resData.data[i].coindata[j].ms_id).addClass(this.class);
                $('#coin_change_' + resData.data[i].coindata[j].ms_id).html(change_num + '%');
                const coin_bid_price = this.decimalpipe.transform(resData.data[i].coindata[j].bid, '1.0-8');
                $('#coin_bid_' + resData.data[i].coindata[j].ms_id).html(coin_bid_price);
                const coin_ask_price = this.decimalpipe.transform(resData.data[i].coindata[j].ask, '1.0-8');
                $('#coin_ask_' + resData.data[i].coindata[j].ms_id).html(coin_ask_price);
                if (this.selectedColumn === 1) {
                  const vol_data = this.decimalpipe.transform(resData.data[i].coindata[j].volume, '1.0-2');
                  $('#coin_volumn_' + resData.data[i].coindata[j].ms_id).html(vol_data);
                } else {
                  const base_vol_data = this.decimalpipe.transform(resData.data[i].coindata[j].base_volume, '1.0-2');
                  $('#base_volumn_' + resData.data[i].coindata[j].ms_id).html(base_vol_data);
                }
                const coin_low_price = this.decimalpipe.transform(resData.data[i].coindata[j].low, '1.0-8');
                $('#coin_low_' + resData.data[i].coindata[j].ms_id).html(coin_low_price);
                const coin_high_price = this.decimalpipe.transform(resData.data[i].coindata[j].high, '1.0-8');
                $('#coin_high_' + resData.data[i].coindata[j].ms_id).html(coin_high_price);
                $('#coin_order_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].open_buy_orders);
                $('#coin_sell_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].open_sell_orders);
                $('#coin_confirm_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].min_confirm);
                $('#coin_fee_' + resData.data[i].coindata[j].ms_id).html(resData.data[i].coindata[j].transaction_fee);
              }
            }
            this.count = 11;
            this.countDown = timer(0, 1000).pipe(
              take(this.count),
              map(() => --this.count)
            );
            this.tempresult = resData.data;
          }
        });
      }
    });
  }

  getCoinTableData(coin) {
    this.showloader = true;
    this.exchangeService.getAllExchange(this.coinexch, this.filter, coin).subscribe(resData => {
      if (resData.status === true) {
        this.showloader = false;
        this.exchangeService.changedata(this.period, this.coinexch).subscribe(res => {
          if (res.status === true) {
            this.changedata = res.data;
            for (let i = 0; i < res.data.length; i++) {
              resData.data.map(function (val, j) {
                if (res.data[i]['pair'] === val['market_name'] && res.data[i]['exchange'] == val['exchange']) {
                  val['volume'] = res.data[i]['volume'];
                  val['base_volume'] = res.data[i]['basevolume'];
                  val['high'] = res.data[i]['high'];
                  val['low'] = res.data[i]['low'];
                  val['prev_day'] = res.data[i]['first'];
                }
              });
            }
            let temparray = [];
            let tempname = '';
            let l = -1;
            let j = 0;
            resData.data.map(function (val, i) {
              if (tempname !== val['market_name']) {
                j = 0;
                l++;
                tempname = val['market_name'];
                temparray[l] = { 'ms_id': val['ms_id'], 'coin': val['market_name'], 'coindata': [val] };
              } else {
                j++;
                temparray[l]['coindata'][j] = val;
              }
            });
            this.result = temparray;
            this.tempresult = temparray;
            // this.result = resData.data;
            // this.tempresult = resData.data;
            /* if (resData.data.length > 0) {
              $('#tbl-coins').DataTable().destroy();
              setTimeout(() => {
                $('#tbl-coins').DataTable({
                  'dom': '<"top"lf>rt<"bottom"ip><"clear">',
                  'lengthMenu': [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
                  'pageLength': 10,
                });
              }, 100);
            } */
            this.showloader = false;
          } else {
            let temparray = [];
            let tempname = '';
            let l = -1;
            let j = 0;
            resData.data.map(function (val, i) {
              if (tempname !== val['market_name']) {
                j = 0;
                l++;
                tempname = val['market_name'];
                temparray[l] = { 'ms_id': val['ms_id'], 'coin': val['market_name'], 'coindata': [val] };
              } else {
                j++;
                temparray[l]['coindata'][j] = val;
              }
            });
            this.result = temparray;
            this.tempresult = temparray;
            this.showloader = false;
          }
        });
      } else {
        this.result = '';
        this.showloader = false;
      }
      this.countDown = timer(0, 1000).pipe(
        take(this.count),
        map(() => --this.count)
      );
    });
  }

  getExchangeTableData(coin) {
    this.showloader = true;
    this.exchangeService.getAllExchange(this.coinexch, this.filter, coin).subscribe(resData => {
      if (resData.status === true) {
        this.exchangeService.changedata(this.period, this.coinexch).subscribe(res => {
          if (res.status === true) {
            this.changedata = res.data;
            for (let i = 0; i < res.data.length; i++) {
              resData.data.map(function (val, j) {
                if (res.data[i]['pair'] === val['market_name'] && res.data[i]['exchange'] == val['exchange']) {
                  val['volume'] = res.data[i]['volume'];
                  val['base_volume'] = res.data[i]['basevolume'];
                  val['high'] = res.data[i]['high'];
                  val['low'] = res.data[i]['low'];
                  val['prev_day'] = res.data[i]['first'];
                }
              });
            }
            let temparraydata = [];
            let tempnamenew = '';
            let l = -1;
            let j = 0;
            resData.data.map(function (val, i) {
              if (tempnamenew !== val['exchange']) {
                j = 0;
                l++;
                tempnamenew = val['exchange'];
                temparraydata[l] = { 'ms_id': val['ms_id'], 'exchange': val['exchange'], 'coindata': [val] };
              } else {
                j++;
                temparraydata[l]['coindata'][j] = val;
              }
            });
            this.tempallresult = temparraydata;
            this.allresult = temparraydata;
            this.showloader = false;
          } else {
            let temparraydata = [];
            let tempnamenew = '';
            let l = -1;
            let j = 0;
            resData.data.map(function (val, i) {
              if (tempnamenew !== val['exchange']) {
                j = 0;
                l++;
                tempnamenew = val['exchange'];
                temparraydata[l] = { 'ms_id': val['ms_id'], 'exchange': val['exchange'], 'coindata': [val] };
              } else {
                j++;
                temparraydata[l]['coindata'][j] = val;
              }
            });
            this.tempallresult = temparraydata;
            this.allresult = temparraydata;
            this.showloader = false;
          }
        });
      } else {
        this.allresult = '';
        this.showloader = false;
      }
      this.countDown = timer(0, 1000).pipe(
        take(this.count),
        map(() => --this.count)
      );
    });
  }

}
