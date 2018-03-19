import { Component, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import * as myGlobals from './../global';
import { ExchangeService } from '../exchange.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { timer } from 'rxjs/observable/timer';
import { take, map } from 'rxjs/operators';

declare var $;

@Component({
  selector: 'app-coinorderbook',
  templateUrl: './coinorderbook.component.html',
  styleUrls: ['./coinorderbook.component.css'],
  providers: [ExchangeService, DatePipe, DecimalPipe],
})
export class CoinorderbookComponent implements OnInit {

  public base_url: any = myGlobals.base_url;
  countDown: any;
  count: any = 11;
  coinlist: any;
  exchangelist: any;
  coinsum: any = 0;
  basesum: any = 0;
  class: any;
  icon: any;
  bidsData: any;
  tempbidsData: any;
  askData: any;
  tempaskData: any;
  coincurr: any = 'BTC';
  coinsel: any;
  coincoin: any;
  coinexch: any;
  marketdata: any;
  tempmarketdata: any;
  showloaderbid: any;
  showloaderask: any;
  showloadermkt: any;
  selectedIndex: any = 1;

  // tslint:disable-next-line:max-line-length
  constructor(private exchangeService: ExchangeService, private router: Router, private http: Http, private decimalpipe: DecimalPipe, private datePipe: DatePipe) {
    this.coinsel = localStorage.getItem('coincoin');
    if (this.coinsel == null) {
      this.coinsel = 'ETH';
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
      for (let i = 0; i < this.coinlist.length; i++) {
        if (this.coinlist[i]['coin_symbol'] === this.coinsel) {
          $('#sel_coin').val(this.coinlist[i]['coin_symbol']);
        }
      }
      this.exchangelist.map(function (val, key) {
        if (val['ex_id'] === 'bittrex') {
          $('#sel_exchange').val(val['ex_id']);
        }
      });
      this.coincoin = $('#sel_coin').val();
      this.coinexch = $('#sel_exchange').val();
      this.coinbookdata(this.coincoin, this.coincurr, this.coinexch);
    }, 2000);

    setInterval(() => {
      this.realcoinbookdata(this.coincoin, this.coincurr, this.coinexch);
    }, 15000);
  }

  toggleClass(coin, index: number) {
    this.selectedIndex = index;
    this.coincurr = coin;
    this.coinbookdata(this.coincoin, this.coincurr, this.coinexch);
  }

  coinchange(value) {
    this.coincoin = value;
    localStorage.setItem('coincoin', value);
    this.coinbookdata(this.coincoin, this.coincurr, this.coinexch);
  }

  exchangechange(value) {
    this.coinexch = value;
    this.coinbookdata(this.coincoin, this.coincurr, this.coinexch);
  }

  realcoinbookdata(coincoin, coincurr, coinexch) {
    this.exchangeService.getbidaskbook(coincoin, coincurr, coinexch).subscribe(res => {
      if (res.status === true) {
        const ab = res.data.bidask;
        for (let i = 0; i < ab.bids.length; i++) {
          ab.bids[i].bid = ab.bids[i]['0'];
          ab.bids[i].size = ab.bids[i]['1'];
          if (i === 0) {
            ab.bids[i].total = ab.bids[i]['0'] * ab.bids[i]['1'];
            ab.bids[i].sum = ab.bids[i]['0'] * ab.bids[i]['1'];
          } else {
            ab.bids[i].total = ab.bids[i]['0'] * ab.bids[i]['1'];
            ab.bids[i].sum = (ab.bids[i]['0'] * ab.bids[i]['1']) + ab.bids[i - 1].sum;
          }
        }
        for (let i = 0; i < ab.bids.length; i++) {
          if (this.tempbidsData[i]['size'] > ab.bids[i]['size']) {
            $('#tr_bids_' + i).removeClass('coin_pump_now');
            $('#tr_bids_' + i).removeClass('coin_pump');
            $('#tr_bids_' + i).addClass('coin_dump_now');
            setTimeout(() => {
              $('#tr_bids_' + i).addClass('coin_dump');
            }, 1000);
          } else if (this.tempbidsData[i]['size'] < ab.bids[i]['size']) {
            $('#tr_bids_' + i).removeClass('coin_dump_now');
            $('#tr_bids_' + i).removeClass('coin_dump');
            $('#tr_bids_' + i).addClass('coin_pump_now');
            setTimeout(() => {
              $('#tr_bids_' + i).addClass('coin_pump');
            }, 1000);
          }
          if (ab.bids[i]['sum'] >= 1000) {
            const sum = this.decimalpipe.transform(ab.bids[i]['sum'], '1.0-5');
            $('#bids_sum_' + i).html(sum);
          } else {
            const sum = this.decimalpipe.transform(ab.bids[i]['sum'], '1.0-8');
            $('#bids_sum_' + i).html(sum);
          }

          if (ab.bids[i]['total'] >= 1000) {
            const total = this.decimalpipe.transform(ab.bids[i]['total'], '1.0-5');
            $('#bids_total_' + i).html(total);
          } else {
            const total = this.decimalpipe.transform(ab.bids[i]['total'], '1.0-8');
            $('#bids_total_' + i).html(total);
          }

          if (ab.bids[i]['size'] >= 1000) {
            const size = this.decimalpipe.transform(ab.bids[i]['size'], '1.0-5');
            $('#bids_size_' + i).html(size);
          } else {
            const size = this.decimalpipe.transform(ab.bids[i]['size'], '1.0-8');
            $('#bids_size_' + i).html(size);
          }

          if (ab.bids[i]['bid'] >= 1000) {
            const bdata = this.decimalpipe.transform(ab.bids[i]['bid'], '1.0-5');
            $('#bids_bid_' + i).html(bdata);
          } else {
            const bdata = this.decimalpipe.transform(ab.bids[i]['bid'], '1.0-8');
            $('#bids_bid_' + i).html(bdata);
          }
        }
        this.tempbidsData = ab.bids;

        for (let j = 0; j < ab.asks.length; j++) {
          ab.asks[j].ask = ab.asks[j]['0'];
          ab.asks[j].size = ab.asks[j]['1'];
          if (j === 0) {
            ab.asks[j].total = ab.asks[j]['0'] * ab.asks[j]['1'];
            ab.asks[j].sum = ab.asks[j]['0'] * ab.asks[j]['1'];
          } else {
            ab.asks[j].total = ab.asks[j]['0'] * ab.asks[j]['1'];
            ab.asks[j].sum = (ab.asks[j]['0'] * ab.asks[j]['1']) + ab.asks[j - 1].sum;
          }
        }
        for (let j = 0; j < ab.asks.length; j++) {
          if (this.tempaskData[j]['size'] > ab.asks[j]['size']) {
            $('#tr_asks_' + j).removeClass('coin_pump_now');
            $('#tr_asks_' + j).removeClass('coin_pump');
            $('#tr_asks_' + j).addClass('coin_dump_now');
            setTimeout(() => {
              $('#tr_asks_' + j).addClass('coin_dump');
            }, 1000);
          } else if (this.tempaskData[j]['size'] < ab.asks[j]['size']) {
            $('#tr_asks_' + j).removeClass('coin_dump_now');
            $('#tr_asks_' + j).removeClass('coin_dump');
            $('#tr_asks_' + j).addClass('coin_pump_now');
            setTimeout(() => {
              $('#tr_asks_' + j).addClass('coin_pump');
            }, 1000);
          }
          if (ab.asks[j]['sum'] >= 1000) {
            const sum = this.decimalpipe.transform(ab.asks[j]['sum'], '1.0-5');
            $('#asks_sum_' + j).html(sum);
          } else {
            const sum = this.decimalpipe.transform(ab.asks[j]['sum'], '1.0-8');
            $('#asks_sum_' + j).html(sum);
          }

          if (ab.asks[j]['total'] >= 1000) {
            const total = this.decimalpipe.transform(ab.asks[j]['total'], '1.0-5');
            $('#asks_total_' + j).html(total);
          } else {
            const total = this.decimalpipe.transform(ab.asks[j]['total'], '1.0-8');
            $('#asks_total_' + j).html(total);
          }

          if (ab.asks[j]['size'] >= 1000) {
            const size = this.decimalpipe.transform(ab.asks[j]['size'], '1.0-5');
            $('#asks_size_' + j).html(size);
          } else {
            const size = this.decimalpipe.transform(ab.asks[j]['size'], '1.0-8');
            $('#asks_size_' + j).html(size);
          }

          if (ab.asks[j]['ask'] >= 1000) {
            const adata = this.decimalpipe.transform(ab.asks[j]['ask'], '1.0-5');
            $('#asks_ask_' + j).html(adata);
          } else {
            const adata = this.decimalpipe.transform(ab.asks[j]['ask'], '1.0-8');
            $('#asks_ask_' + j).html(adata);
          }
        }
        this.tempaskData = ab.asks;
      }

      if (this.coinexch === 'poloniex') {
        res.data.order.map(function (val, key) {
          res.data.order[key].datetime = val['date'];
          res.data.order[key].side = val['type'];
          res.data.order[key].price = val['rate'];
        });
      }
      const result = res.data.order;
      for (let i = 0; i < result.length; i++) {
        if (this.tempmarketdata[i]['price'] > result[i]['price']) {
          $('#tr_mkt_' + i).removeClass('coin_pump_now');
          $('#tr_mkt_' + i).removeClass('coin_pump');
          $('#tr_mkt_' + i).addClass('coin_dump_now');
          setTimeout(() => {
            $('#tr_mkt_' + i).addClass('coin_dump');
          }, 1000);
        } else if (this.tempmarketdata[i]['price'] < result[i]['price']) {
          $('#tr_mkt_' + i).removeClass('coin_dump_now');
          $('#tr_mkt_' + i).removeClass('coin_dump');
          $('#tr_mkt_' + i).addClass('coin_pump_now');
          setTimeout(() => {
            $('#tr_mkt_' + i).addClass('coin_pump');
          }, 1000);
        }
        // const tempdate = result[i]['datetime'].substring(0, result[i]['datetime'].length - 2);
        // const tdate = tempdate.toLocaleString();
        const date = this.datePipe.transform(result[i]['datetime'], 'dd/MM/yyyy h:mm:ss a');
        $('#mkt_date_' + i).html(date);
        if (result[i]['side'] === 'buy') {
          $('#mkt_type_' + i).removeClass('red-text');
          $('#mkt_type_' + i).addClass('green-text');
          this.icon = ' <i class="fa fa-arrow-up"></i>';
        } else {
          $('#mkt_type_' + i).removeClass('green-text');
          $('#mkt_type_' + i).addClass('red-text');
          this.icon = ' <i class="fa fa-arrow-down"></i>';
        }
        $('#mkt_type_' + i).html(result[i]['side'] + this.icon);

        if (result[i]['price'] >= 1000) {
          const Price = this.decimalpipe.transform(result[i]['price'], '1.0-5');
          $('#mkt_price_' + i).html(Price);
        } else {
          const Price = this.decimalpipe.transform(result[i]['price'], '1.0-8');
          $('#mkt_price_' + i).html(Price);
        }

        if (result[i]['amount'] >= 1000) {
          const Quantity = this.decimalpipe.transform(result[i]['amount'], '1.0-5');
          $('#mkt_qty_' + i).html(Quantity);
        } else {
          const Quantity = this.decimalpipe.transform(result[i]['amount'], '1.0-8');
          $('#mkt_qty_' + i).html(Quantity);
        }

        if (result[i]['price'] * result[i]['amount'] >= 1000) {
          const Total = this.decimalpipe.transform(result[i]['price'] * result[i]['amount'], '1.0-5');
          $('#mkt_total_' + i).html(Total);
        } else {
          const Total = this.decimalpipe.transform(result[i]['price'] * result[i]['amount'], '1.0-8');
          $('#mkt_total_' + i).html(Total);
        }
      }
      this.tempmarketdata = res.data.order;
      this.count = 11;
      this.countDown = timer(0, 1000).pipe(
        take(this.count),
        map(() => --this.count)
      );
    });
  }

  coinbookdata(coincoin, coincurr, coinexch) {
    this.showloaderbid = true;
    this.showloaderask = true;
    this.showloadermkt = true;
    this.exchangeService.getbidaskbook(coincoin, coincurr, coinexch).subscribe(res => {
      if (res.status === true) {
        const ab = res.data.bidask;
        for (let i = 0; i < ab.bids.length; i++) {
          ab.bids[i].bid = ab.bids[i]['0'];
          ab.bids[i].size = ab.bids[i]['1'];
          if (i === 0) {
            ab.bids[i].total = ab.bids[i]['0'] * ab.bids[i]['1'];
            ab.bids[i].sum = ab.bids[i]['0'] * ab.bids[i]['1'];
          } else {
            ab.bids[i].total = ab.bids[i]['0'] * ab.bids[i]['1'];
            ab.bids[i].sum = (ab.bids[i]['0'] * ab.bids[i]['1']) + ab.bids[i - 1].sum;
          }
        }
        this.bidsData = ab.bids;
        this.tempbidsData = ab.bids;
        $('#bids_table').DataTable().destroy();
        setTimeout(() => {
          $('#bids_table').DataTable({
            'dom': '<"top">rt<"bottom"><"clear">',
            'pageLength': 100000,
            // 'ordering': false,
          });
          $('.top').hide();
        }, 100);
        this.showloaderbid = false;

        for (let j = 0; j < ab.asks.length; j++) {
          ab.asks[j].ask = ab.asks[j]['0'];
          ab.asks[j].size = ab.asks[j]['1'];
          if (j === 0) {
            ab.asks[j].total = ab.asks[j]['0'] * ab.asks[j]['1'];
            ab.asks[j].sum = ab.asks[j]['0'] * ab.asks[j]['1'];
          } else {
            ab.asks[j].total = ab.asks[j]['0'] * ab.asks[j]['1'];
            ab.asks[j].sum = (ab.asks[j]['0'] * ab.asks[j]['1']) + ab.asks[j - 1].sum;
          }
        }
        this.askData = ab.asks;
        this.tempaskData = ab.asks;
        $('#ask_table').DataTable().destroy();
        setTimeout(() => {
          $('#ask_table').DataTable({
            'dom': '<"top">rt<"bottom"><"clear">',
            'pageLength': 1000000,
            // 'ordering': false,
          });
          $('.top').hide();
        }, 100);
        this.showloaderask = false;

        if (this.coinexch === 'poloniex') {
          res.data.order.map(function (val, key) {
            const tempdate = val['date'].substring(0, val['date'].length - 2);
            res.data.order[key].datetime = val['date'];
            res.data.order[key].side = val['type'];
            res.data.order[key].price = val['rate'];
          });
        }
        this.marketdata = res.data.order;
        this.tempmarketdata = res.data.order;
        $('#market_table').DataTable().destroy();
        setTimeout(() => {
          $('#market_table').DataTable({
            'dom': '<"top"l>rt<"bottom"p><"clear">',
            'lengthMenu': [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
            'pageLength': 10,
            'order': [[0, 'desc']]
          });
        }, 100);
        this.showloadermkt = false;
        this.countDown = timer(0, 1000).pipe(
          take(this.count),
          map(() => --this.count)
        );
      } else {
        this.bidsData = '';
        this.askData = '';
        this.marketdata = '';
        this.showloaderbid = false;
        this.showloaderask = false;
        this.showloadermkt = false;
        this.countDown = timer(0, 1000).pipe(
          take(this.count),
          map(() => --this.count)
        );
      }
    });
  }
}
