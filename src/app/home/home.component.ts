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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ExchangeService, DecimalPipe],
})
export class HomeComponent implements OnInit {

  public base_url: any = myGlobals.base_url;
  countDown: any;
  count: any = 11;
  period: any = '24h';
  changedata: any;
  result: any;
  tresult: any;
  tempresult: any;
  key: any = -1;
  class: any;
  currcoin: any = '';
  exchange: any[] = [];
  datachange: any;
  /* datachange = {
    last: '',
  }; */
  exchangeName: any = 'BTC';
  selectedIndex: any = 1;
  selectedTime: any = 3;
  selectedColumn: any = 1;
  showloader: any;
  showtable: any;
  exchangelist: any;
  coinexch: any;

  constructor(private exchangeService: ExchangeService, private router: Router, private http: Http, private decimalpipe: DecimalPipe) { }

  toggleClass(coin, index: number) {
    this.selectedIndex = index;
    this.exchangeName = coin;
    this.cointabledata(this.exchangeName);
  }

  toggleTime(time, index: number) {
    this.selectedTime = index;
    this.period = time;
    this.cointabledata(this.exchangeName);
  }

  changeColumn(index: number, column) {
    this.selectedColumn = index;
    $('#filter-menu').html(column);
  }

  exchangechange(value) {
    this.coinexch = value;
    this.cointabledata(this.exchangeName);
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
      this.cointabledata(this.exchangeName);
    }, 1000);
    setInterval(() => {
      this.realtimetabledata(this.exchangeName);
    }, 14000);
  }

  realtimetabledata(coin) {
    this.exchangeService.getExchangeCoin(this.coinexch, coin).subscribe(resData => {
      if (resData.status === true) {
        this.exchangeService.changedata(this.period, this.coinexch).subscribe(res => {
          if (res.status === true) {
            for (let i = 0; i < res.data.length; i++) {
              resData.data.map(function (val, j) {
                if (res.data[i]['pair'] === val['market_name']) {
                  val['volume'] = res.data[i]['volume'];
                  val['base_volume'] = res.data[i]['basevolume'];
                  val['high'] = res.data[i]['high'];
                  val['low'] = res.data[i]['low'];
                  val['prev_day'] = res.data[i]['first'];
                }
              });
            }
            for (let i = 0; i < resData.data.length; i++) {
              if (this.tempresult[i].last < resData.data[i].last) {
                $('#tr_' + resData.data[i].ms_id).removeClass('coin_dump_now');
                $('#tr_' + resData.data[i].ms_id).removeClass('coin_dump');
                $('#tr_' + resData.data[i].ms_id).addClass('coin_pump_now');
                setTimeout(() => {
                  $('#tr_' + resData.data[i].ms_id).addClass('coin_pump');
                }, 1000);
              } else if (this.tempresult[i].last > resData.data[i].last) {
                $('#tr_' + resData.data[i].ms_id).removeClass('coin_pump_now');
                $('#tr_' + resData.data[i].ms_id).removeClass('coin_pump');
                $('#tr_' + resData.data[i].ms_id).addClass('coin_dump_now');
                setTimeout(() => {
                  $('#tr_' + resData.data[i].ms_id).addClass('coin_dump');
                }, 1000);
              }
              const last_price = this.decimalpipe.transform(resData.data[i].last, '1.0-8');
              $('#last_' + resData.data[i].ms_id).html(last_price);
              const change = ((resData.data[i].last - resData.data[i].prev_day) / resData.data[i].last) * 100;
              const change_num = this.decimalpipe.transform(change, '1.0-2');
              if (change > 0) {
                this.class = 'green';
              } else {
                this.class = 'red';
              }
              $('#change_' + resData.data[i].ms_id).addClass(this.class);
              $('#change_' + resData.data[i].ms_id).html(change_num + '%');
              const bid_price = this.decimalpipe.transform(resData.data[i].bid, '1.0-8');
              $('#bid_' + resData.data[i].ms_id).html(bid_price);
              const ask_price = this.decimalpipe.transform(resData.data[i].ask, '1.0-8');
              $('#ask_' + resData.data[i].ms_id).html(ask_price);
              if (this.selectedColumn === 1) {
                const vol_data = this.decimalpipe.transform(resData.data[i].volume, '1.0-2');
                $('#volumn_' + resData.data[i].ms_id).html(vol_data);
              } else {
                const base_vol_data = this.decimalpipe.transform(resData.data[i].base_volume, '1.0-2');
                $('#base_volumn_' + resData.data[i].ms_id).html(base_vol_data);
              }
              const low_price = this.decimalpipe.transform(resData.data[i].low, '1.0-8');
              $('#low_' + resData.data[i].ms_id).html(low_price);
              const high_price = this.decimalpipe.transform(resData.data[i].high, '1.0-8');
              $('#high_' + resData.data[i].ms_id).html(high_price);
              $('#order_' + resData.data[i].ms_id).html(resData.data[i].open_buy_orders);
              $('#sell_' + resData.data[i].ms_id).html(resData.data[i].open_sell_orders);
              $('#confirm_' + resData.data[i].ms_id).html(resData.data[i].min_confirm);
              $('#fee_' + resData.data[i].ms_id).html(resData.data[i].transaction_fee);
            }
            this.tempresult = resData.data;
            this.count = 11;
            this.countDown = timer(0, 1000).pipe(
              take(this.count),
              map(() => --this.count)
            );
          } else {
            for (let i = 0; i < resData.data.length; i++) {
              if (this.tempresult[i].last < resData.data[i].last) {
                $('#tr_' + resData.data[i].ms_id).removeClass('coin_dump_now');
                $('#tr_' + resData.data[i].ms_id).removeClass('coin_dump');
                $('#tr_' + resData.data[i].ms_id).addClass('coin_pump_now');
                setTimeout(() => {
                  $('#tr_' + resData.data[i].ms_id).addClass('coin_pump');
                }, 1000);
              } else if (this.tempresult[i].last > resData.data[i].last) {
                $('#tr_' + resData.data[i].ms_id).removeClass('coin_pump_now');
                $('#tr_' + resData.data[i].ms_id).removeClass('coin_pump');
                $('#tr_' + resData.data[i].ms_id).addClass('coin_dump_now');
                setTimeout(() => {
                  $('#tr_' + resData.data[i].ms_id).addClass('coin_dump');
                }, 1000);
              }
              const last_price = this.decimalpipe.transform(resData.data[i].last, '1.0-8');
              $('#last_' + resData.data[i].ms_id).html(last_price);
              const change = ((resData.data[i].last - resData.data[i].prev_day) / resData.data[i].last) * 100;
              const change_num = this.decimalpipe.transform(change, '1.0-2');
              if (change > 0) {
                this.class = 'green';
              } else {
                this.class = 'red';
              }
              $('#change_' + resData.data[i].ms_id).addClass(this.class);
              $('#change_' + resData.data[i].ms_id).html(change_num + '%');
              const bid_price = this.decimalpipe.transform(resData.data[i].bid, '1.0-8');
              $('#bid_' + resData.data[i].ms_id).html(bid_price);
              const ask_price = this.decimalpipe.transform(resData.data[i].ask, '1.0-8');
              $('#ask_' + resData.data[i].ms_id).html(ask_price);
              if (this.selectedColumn === 1) {
                const vol_data = this.decimalpipe.transform(resData.data[i].volume, '1.0-2');
                $('#volumn_' + resData.data[i].ms_id).html(vol_data);
              } else {
                const base_vol_data = this.decimalpipe.transform(resData.data[i].base_volume, '1.0-2');
                $('#base_volumn_' + resData.data[i].ms_id).html(base_vol_data);
              }
              const low_price = this.decimalpipe.transform(resData.data[i].low, '1.0-8');
              $('#low_' + resData.data[i].ms_id).html(low_price);
              const high_price = this.decimalpipe.transform(resData.data[i].high, '1.0-8');
              $('#high_' + resData.data[i].ms_id).html(high_price);
              $('#order_' + resData.data[i].ms_id).html(resData.data[i].open_buy_orders);
              $('#sell_' + resData.data[i].ms_id).html(resData.data[i].open_sell_orders);
              $('#confirm_' + resData.data[i].ms_id).html(resData.data[i].min_confirm);
              $('#fee_' + resData.data[i].ms_id).html(resData.data[i].transaction_fee);
            }
            this.tempresult = resData.data;
            this.count = 11;
            this.countDown = timer(0, 1000).pipe(
              take(this.count),
              map(() => --this.count)
            );
          }
        });
      }
    });
  }

  cointabledata(coin) {
    this.showloader = true;
    this.exchangeService.getExchangeCoin(this.coinexch, coin).subscribe(resData => {
      if (resData.status === true) {
        this.exchangeService.changedata(this.period, this.coinexch).subscribe(res => {
          if (res.status === true) {
            this.changedata = res.data;
            for (let i = 0; i < res.data.length; i++) {
              resData.data.map(function (val, j) {
                if (res.data[i]['pair'] === val['market_name']) {
                  val['volume'] = res.data[i]['volume'];
                  val['base_volume'] = res.data[i]['basevolume'];
                  val['high'] = res.data[i]['high'];
                  val['low'] = res.data[i]['low'];
                  val['prev_day'] = res.data[i]['first'];
                  // val['cal'] = ((val['last'] - val['prev_day']) / val['last']) * 100;
                }
              });
            }
            this.result = resData.data;
            this.tempresult = resData.data;
            if (resData.data.length > 0) {
              $('#coinlist').DataTable().destroy();
              setTimeout(() => {
                $('#coinlist').DataTable({
                  'dom': '<"top"lf>rt<"bottom"ip><"clear">',
                  'lengthMenu': [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
                  'pageLength': 10,
                });
              }, 100);
            }
            this.showloader = false;
          } else {
            this.result = resData.data;
            this.tempresult = resData.data;
            if (resData.data.length > 0) {
              $('#coinlist').DataTable().destroy();
              setTimeout(() => {
                $('#coinlist').DataTable({
                  'dom': '<"top"lf>rt<"bottom"ip><"clear">',
                  'lengthMenu': [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
                  'pageLength': 10,
                });
              }, 100);
            }
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
}
