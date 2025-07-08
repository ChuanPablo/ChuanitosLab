import { Injectable, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIG_URL } from '@lab/shared-utils';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _apiUrl = signal('');
  private _appName = signal("Chuanito's Lab");

  constructor(private http: HttpClient) {
    console.log(`Config URL ${CONFIG_URL}`);
    this.loadConfig();
  }

  loadConfig(){
    return this.http.get<any>(CONFIG_URL).pipe(
      tap(config => {
        console.log('config loaded successfully')
        this._apiUrl.set(config.API_URL); console.log(`API URL: ${this._apiUrl()}`);
        this._appName.set(config.APP_NAME); console.log(`App name: ${this._appName()}`);
      })
    );
  }

  get apiUrl(): Signal<string> {
    return this._apiUrl.asReadonly();
  }

  get appName(): Signal<string> {
    return this._appName.asReadonly();
  }
}
