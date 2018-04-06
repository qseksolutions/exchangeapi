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
  totalmarketdata: any;
  showloaderbid: any;
  showloaderask: any;
  showloadermkt: any;
  selectedIndex: any = 1;
  limit: number = 10;
  start: number = 0;
  next: number = 1;

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
      this.coinbookdata();
    }, 2000);

    setInterval(() => {
      this.realcoinbookdata(this.coincoin, this.coincurr, this.coinexch);
    }, 15000);
  }

  toggleClass(coin, index: number) {
    this.selectedIndex = index;
    this.coincurr = coin;
    this.coinbookdata();
  }

  coinchange(value) {
    this.coincoin = value;
    localStorage.setItem('coincoin', value);
    this.coinbookdata();
  }

  exchangechange(value) {
    this.coinexch = value;
    this.coinbookdata();
  }

  nextpage() {
    this.start = this.limit*this.next;
    this.next++;
    this.coinmarketdata();
  }

  prevpage() {
    this.next--;
    this.start = this.limit*this.next;
    this.coinmarketdata();
  }

  datachange(value: number) {
    this.limit = value;
    this.limit = +this.limit;
    this.next = 1;
    this.start = 0;
    this.coinmarketdata();
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
    });
    this.exchangeService.markethistorydata(this.coincoin + '-' + this.coincurr, this.coinexch, this.limit, this.start).subscribe(resData => {
      if (resData.status == true) {
        const result = resData.data;
        for (let i = 0; i < result.length; i++) {
          if (this.tempmarketdata[i]['rate'] > result[i]['rate']) {
            $('#tr_mkt_' + i).removeClass('coin_pump_now');
            $('#tr_mkt_' + i).removeClass('coin_pump');
            $('#tr_mkt_' + i).addClass('coin_dump_now');
            setTimeout(() => {
              $('#tr_mkt_' + i).addClass('coin_dump');
            }, 1000);
          } else if (this.tempmarketdata[i]['rate'] < result[i]['rate']) {
            $('#tr_mkt_' + i).removeClass('coin_dump_now');
            $('#tr_mkt_' + i).removeClass('coin_dump');
            $('#tr_mkt_' + i).addClass('coin_pump_now');
            setTimeout(() => {
              $('#tr_mkt_' + i).addClass('coin_pump');
            }, 1000);
          }
          const date = this.datePipe.transform(result[i]['timestamp'], 'dd/MM/yyyy h:mm:ss a');
          $('#mkt_date_' + i).html(date);
          if (result[i]['order_type'] === 'BUY') {
            $('#mkt_type_' + i).removeClass('red-text');
            $('#mkt_type_' + i).addClass('green-text');
            this.icon = ' <i class="fa fa-arrow-up"></i>';
          } else {
            $('#mkt_type_' + i).removeClass('green-text');
            $('#mkt_type_' + i).addClass('red-text');
            this.icon = ' <i class="fa fa-arrow-down"></i>';
          }
          $('#mkt_type_' + i).html(result[i]['order_type'] + this.icon);

          if (result[i]['rate'] >= 1000) {
            const Price = this.decimalpipe.transform(result[i]['rate'], '1.0-5');
            $('#mkt_price_' + i).html(Price);
          } else {
            const Price = this.decimalpipe.transform(result[i]['rate'], '1.0-8');
            $('#mkt_price_' + i).html(Price);
          }

          if (result[i]['quantity'] >= 1000) {
            const Quantity = this.decimalpipe.transform(result[i]['quantity'], '1.0-5');
            $('#mkt_qty_' + i).html(Quantity);
          } else {
            const Quantity = this.decimalpipe.transform(result[i]['quantity'], '1.0-8');
            $('#mkt_qty_' + i).html(Quantity);
          }
 
          if (result[i]['total'] >= 1000) {
            const Total = this.decimalpipe.transform(result[i]['total'], '1.0-5');
            $('#mkt_total_' + i).html(Total);
          } else {
            const Total = this.decimalpipe.transform(result[i]['total'], '1.0-8');
            $('#mkt_total_' + i).html(Total);
          }
        }
        this.tempmarketdata = resData.data;
        this.totalmarketdata = resData.totalCount;
        this.count = 11;
        this.countDown = timer(0, 1000).pipe(
          take(this.count),
          map(() => --this.count)
        );
      }
    });
  }

  coinbookdata() {
    this.showloaderbid = true;
    this.showloaderask = true;
    this.showloadermkt = true;
    this.exchangeService.getbidaskbook(this.coincoin, this.coincurr, this.coinexch).subscribe(res => {
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
      } else {
        this.bidsData = '';
        this.askData = '';
        this.showloaderbid = false;
        this.showloaderask = false;
      }
    });
    this.exchangeService.markethistorydata(this.coincoin + '-' + this.coincurr, this.coinexch, this.limit, this.start).subscribe(resData => {
      if (resData.status === true) {
        this.marketdata = resData.data;
        this.tempmarketdata = resData.data;
        this.totalmarketdata = resData.totalCount;
        this.showloadermkt = false;
        this.countDown = timer(0, 1000).pipe(
          take(this.count),
          map(() => --this.count)
        );
      } else {
        this.marketdata = '';
        this.showloadermkt = false;
        this.countDown = timer(0, 1000).pipe(
          take(this.count),
          map(() => --this.count)
        );
      }
    });
  }

  coinmarketdata() {
    this.showloadermkt = true;
    this.exchangeService.markethistorydata(this.coincoin + '-' + this.coincurr, this.coinexch, this.limit, this.start).subscribe(resData => {
      if (resData.status === true) {
        this.marketdata = resData.data;
        this.tempmarketdata = resData.data;
        this.totalmarketdata = resData.totalCount;
        this.showloadermkt = false;
      } else {
        this.marketdata = '';
        this.showloadermkt = false;
      }
    });
  }
}
