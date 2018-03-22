import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import * as myGlobals from './global';
import 'rxjs/add/operator/map';
import { URLSearchParams } from '@angular/http';


@Injectable()
export class ExchangeService {

  api_url: any = myGlobals.api_url;
  exchangelist: any = myGlobals.exchangelist;
  allexchangelist: any = myGlobals.allexchangelist;
  singlecoinlist: any = myGlobals.singlecoinlist;
  getbidasklist: any = myGlobals.getbidasklist;
  getbidaskandorderlist: any = myGlobals.getbidaskandorderlist;
  getcoinlistlist: any = myGlobals.getcoinlistlist;
  getexchangelistlist: any = myGlobals.getexchangelistlist;
  getarbilist: any = myGlobals.getarbilist;

  new_api_url: any = myGlobals.new_api_url;
  alltradelist: any = myGlobals.alltradelist;
  tradebyexchangelist: any = myGlobals.tradebyexchangelist;
  markethistory: any = myGlobals.markethistory;

  constructor(private http: Http) { }

  getExchangeCoin(ex_id, coin) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });

    const form = new URLSearchParams();
    form.append('ex_id', ex_id);

    return this.http.post(this.api_url + this.exchangelist + '/' + coin, form, options)
      .map((response: Response) => response.json());
  }

  getAllExchange(ex_id, filter, coin) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });

    const form = new URLSearchParams();
    form.append('sorting', filter);
    form.append('ex_id', ex_id);

    return this.http.post(this.api_url + this.allexchangelist + '/' + coin, form, options)
      .map((response: Response) => response.json());
  }

  getsinglecoindata(coin) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });

    const form = new URLSearchParams();
    form.append('ms_id', coin);

    return this.http.post(this.api_url + this.singlecoinlist, form, options)
      .map((response: Response) => response.json());
  }

  getbidask(coin, base, exchange) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });

    const form = new URLSearchParams();
    form.append('coin', coin);
    form.append('base', base);
    form.append('ex_id', exchange);

    return this.http.post(this.api_url + this.getbidasklist, form, options)
      .map((response: Response) => response.json());
  }

  getbidaskbook(coin, base, exchange) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });

    const form = new URLSearchParams();
    form.append('coin', coin);
    form.append('base', base);
    form.append('ex_id', exchange);

    return this.http.post(this.api_url + this.getbidasklist, form, options)
      .map((response: Response) => response.json());
  }

  getcoinlist() {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });
    return this.http.get(this.api_url + this.getcoinlistlist, options)
      .map((response: Response) => response.json());
  }

  getexchangelist() {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });
    return this.http.get(this.api_url + this.getexchangelistlist, options)
      .map((response: Response) => response.json());
  }
  
  getarbi(coin, base, exchange1, exchange2) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });

    const form = new URLSearchParams();
    form.append('coin', coin);
    form.append('base', base);
    form.append('exchange1', exchange1);
    form.append('exchange2', exchange2);

    return this.http.post(this.api_url + this.getarbilist, form, options)
      .map((response: Response) => response.json());
  }

  /* changedata(period) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });

    const form = new URLSearchParams();
    form.append('period', period);

    return this.http.post(this.new_api_url + this.alltradelist, form, options)
      .map((response: Response) => response.json());
  } */

  changedata(period, ex_id) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });

    const form = new URLSearchParams();
    form.append('period', period);
    form.append('ex_id', ex_id);

    return this.http.post(this.new_api_url + this.tradebyexchangelist, form, options)
      .map((response: Response) => response.json());
  }
  
  markethistorydata(pair, ex_id, limit, start) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({ headers: headers });

    const form = new URLSearchParams();
    form.append('market_name', pair);
    form.append('ex_id', ex_id);
    form.append('limit', limit);
    form.append('start', start);

    return this.http.post(this.new_api_url + this.markethistory, form, options)
      .map((response: Response) => response.json());
  }
}
