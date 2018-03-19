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
  selector: 'app-coin',
  templateUrl: './coin.component.html',
  styleUrls: ['./coin.component.css'],
  providers: [ExchangeService, DatePipe, DecimalPipe],
})
export class CoinComponent implements OnInit {

  public base_url: any = myGlobals.base_url;
  countDown: any;
  count: any = 11;
  x11: any;
  class: any;
  icon: any;
  coin: any;
  tempcoin: any;
  bidsData: any;
  tempbidsData: any;
  askData: any;
  tempaskData: any;
  coincurr: any;
  coincoin: any;
  marketdata: any;
  tempmarketdata: any;
  showloaderbid: any;
  showloaderask: any;
  showloadermkt: any;

  // tslint:disable-next-line:max-line-length
  constructor(private exchangeService: ExchangeService, private router: Router, private http: Http, private decimalpipe: DecimalPipe, private datePipe: DatePipe) { }

  ngOnInit() {
    const curl = window.location.href;
    const ccoin = curl.split('/');
    if (ccoin[4] === '') {
      location.href = this.base_url;
    }
    this.singlecoindata(ccoin[4]);
    setInterval(() => {
      this.realsinglecoindata(ccoin[4]);
    }, 13000);
  }

  addCommas(nStr) {
    nStr += '';
    const x = nStr.split('.');
    const x1 = x[0];
    const x2 = x.length > 1 ? '.' + x[1] : '';
    const rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      this.x11 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return this.x11 + x2;
  }

  realsinglecoindata(coin) {
    this.exchangeService.getsinglecoindata(coin).subscribe(resData => {
      if (resData.status === true) {
        // this.coin = resData.data;
        if (this.tempcoin['last'] > resData.data['last']) {
          $('.main_last').removeClass('coin_pump_now coin_pump').addClass('coin_dump_now');
          setTimeout(() => {
            $('.main_last').addClass('coin_dump');
          }, 1000);
          const lastp = this.decimalpipe.transform(resData.data['last'], '1.0-8');
          $('#last_price').html(lastp + ' <span class="curr_size">' + this.coincurr + '</span>');
          $('.main_last_color').removeClass('green-text').addClass('red-text');
          $('.last_class').removeClass('fa-arrow-up').addClass('fa-arrow-down');
        } else if (this.tempcoin['last'] < resData.data['last']) {
          $('.main_last').removeClass('coin_dump_now coin_dump').addClass('coin_pump_now');
          setTimeout(() => {
            $('.main_last').addClass('coin_pump');
          }, 1000);
          const lastp = this.decimalpipe.transform(resData.data['last'], '1.0-8');
          $('#last_price').html(lastp + ' <span class="curr_size">' + this.coincurr + '</span>');
          $('.main_last_color').removeClass('red-text').addClass('green-text');
          $('.last_class').removeClass('fa-arrow-down').addClass('fa-arrow-up');
        }

        const volumnp = this.decimalpipe.transform(resData.data['volume'], '1.0-2');
        $('#volume_price').html(volumnp + ' <span class="curr_size">' + this.coincurr + '</span>');
        const volumn_basep = this.decimalpipe.transform(resData.data['base_volume'], '1.0-2');
        $('#volumn_base_price').html(volumn_basep + ' <span class="curr_size">' + resData.data['base_currency'] + '</span>');

        if (this.tempcoin['bid'] > resData.data['bid']) {
          $('.main_bid').removeClass('coin_pump_now coin_pump').addClass('coin_dump_now');
          setTimeout(() => {
            $('.main_bid').addClass('coin_dump');
          }, 1000);
          const bidp = this.decimalpipe.transform(resData.data['bid'], '1.0-8');
          $('#bid_price').html(bidp + ' <span class="curr_size">' + this.coincurr + '</span>');
          $('.main_bid_color').removeClass('green-text').addClass('red-text');
          $('.bid_class').removeClass('fa-arrow-up').addClass('fa-arrow-down');
        } else if (this.tempcoin['bid'] < resData.data['bid']) {
          $('.main_bid').removeClass('coin_dump_now coin_dump').addClass('coin_pump_now');
          setTimeout(() => {
            $('.main_bid').addClass('coin_pump');
          }, 1000);
          const bidp = this.decimalpipe.transform(resData.data['bid'], '1.0-2');
          $('#bid_price').html(bidp + ' <span class="curr_size">' + this.coincurr + '</span>');
          $('.main_bid_color').removeClass('red-text').addClass('green-text');
          $('.bid_class').removeClass('fa-arrow-down').addClass('fa-arrow-up');
        }

        if (this.tempcoin['ask'] > resData.data['ask']) {
          $('.main_ask').removeClass('coin_pump_now coin_pump').addClass('coin_dump_now');
          setTimeout(() => {
            $('.main_ask').addClass('coin_dump');
          }, 1000);
          const askp = this.decimalpipe.transform(resData.data['ask'], '1.0-8');
          $('#ask_price').html(askp + ' <span class="curr_size">' + this.coincurr + '</span>');
          $('.main_ask_color').removeClass('green-text').addClass('red-text');
          $('.ask_class').removeClass('fa-arrow-up').addClass('fa-arrow-down');
        } else if (this.tempcoin['ask'] < resData.data['ask']) {
          $('.main_ask').removeClass('coin_dump_now coin_dump').addClass('coin_pump_now');
          setTimeout(() => {
            $('.main_ask').addClass('coin_pump');
          }, 1000);
          const askp = this.decimalpipe.transform(resData.data['ask'], '1.0-2');
          $('#ask_price').html(askp + ' <span class="curr_size">' + this.coincurr + '</span>');
          $('.main_ask_color').removeClass('red-text').addClass('green-text');
          $('.ask_class').removeClass('fa-arrow-down').addClass('fa-arrow-up');
        }
        this.tempcoin = resData.data;

        this.exchangeService.getbidask(this.coincoin, this.coincurr).subscribe(res => {
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

            for (let k = 0; k < ab.asks.length; k++) {
              ab.asks[k].ask = ab.asks[k]['0'];
              ab.asks[k].size = ab.asks[k]['1'];
              if (k === 0) {
                ab.asks[k].total = ab.asks[k]['0'] * ab.asks[k]['1'];
                ab.asks[k].sum = ab.asks[k]['0'] * ab.asks[k]['1'];
              } else {
                ab.asks[k].total = ab.asks[k]['0'] * ab.asks[k]['1'];
                ab.asks[k].sum = (ab.asks[k]['0'] * ab.asks[k]['1']) + ab.asks[k - 1].sum;
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

            if (res.data.order.length > 0) {
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
              this.tempmarketdata = result;
            }
          }

        });
      }
      this.count = 11;
      this.countDown = timer(0, 1000).pipe(
        take(this.count),
        map(() => --this.count)
      );
    });
  }

  singlecoindata(coin) {
    this.showloaderbid = true;
    this.showloaderask = true;
    this.showloadermkt = true;
    this.exchangeService.getsinglecoindata(coin).subscribe(resData => {
      if (resData.status === true) {
        this.tempcoin = resData.data;
        this.coin = resData.data;
        this.coincurr = resData.data.base_currency;
        this.coincoin = resData.data.market_currency;

        this.exchangeService.getbidask(this.coincoin, this.coincurr).subscribe(res => {
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
              });
              $('.top').hide();
            }, 100);
            this.showloaderask = false;

            this.marketdata = res.data.order;
            this.tempmarketdata = res.data.order;
            $('#market_table').DataTable().destroy();
            setTimeout(() => {
              $('#market_table').DataTable({
                'dom': '<"top"l>rt<"bottom"p><"clear">',
                'pageLength': 10,
                'lengthMenu': [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
                // 'ordering': false,
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
          }
        });
      }
    });
  }
}
