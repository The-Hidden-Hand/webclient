import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../../shared/config';

@Injectable()
export class BitcoinService {
  constructor(private http: HttpClient) {
  }

  getBitcoinServiceValue(data: any) {
    return this.http.get<any>(`${apiUrl}btc-wallet/btc-price/`, data);
  }

  createNewWallet(data: any) {
    return this.http.post<any>(`${apiUrl}btc-wallet/create/`, data);
  }

  checkTransaction(data: any) {
    return this.http.get(`${apiUrl}btc-wallet/check/?address=${data.from_address}`);
  }
}
