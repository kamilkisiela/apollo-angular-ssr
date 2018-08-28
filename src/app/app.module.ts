import { NgModule, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  BrowserModule,
  BrowserTransferStateModule,
  TransferState,
  makeStateKey,
} from '@angular/platform-browser';
// Apollo
import { ApolloModule, Apollo } from 'apollo-angular';
import {
  HttpLinkModule,
  HttpLink,
  HttpLinkHandler,
} from 'apollo-angular-link-http';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';

import { AppComponent } from './app.component';
import { ListComponent } from './list.component';
import { UpvoterComponent } from './upvoter.component';

// GraphiQL: https://launchpad.graphql.com/1jzxrj179
const uri = 'https://1jzxrj179.lp.gql.zone/graphql';

const STATE_KEY = makeStateKey<any>('apollo.state');

@NgModule({
  declarations: [AppComponent, ListComponent, UpvoterComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'example' }),
    HttpClientModule,
    BrowserTransferStateModule,
    HttpLinkModule,
    ApolloModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  cache: InMemoryCache;
  link: HttpLinkHandler;

  constructor(
    private readonly apollo: Apollo,
    private readonly transferState: TransferState,
    private readonly httpLink: HttpLink,
    @Inject(PLATFORM_ID) readonly platformId: Object
  ) {
    // tells if it's browser or server
    const isBrowser = isPlatformBrowser(platformId);

    this.cache = new InMemoryCache();
    this.link = this.httpLink.create({ uri });

    this.apollo.create({
      link: this.link,
      cache: this.cache,
      ...(isBrowser
        ? {
            // queries with `forceFetch` enabled will be delayed
            ssrForceFetchDelay: 200,
          }
        : {
            // avoid to run twice queries with `forceFetch` enabled
            ssrMode: true,
          }),
    });

    if (isBrowser) {
      this.onBrowser();
    } else {
      this.onServer();
    }
  }

  onServer() {
    // serializes the cache and puts it under a key
    this.transferState.onSerialize(STATE_KEY, () => this.cache.extract());
  }

  onBrowser() {
    // reads the serialized cache
    const state = this.transferState.get<NormalizedCacheObject>(
      STATE_KEY,
      null,
    );
    // and puts it in the Apollo
    this.cache.restore(state);
  }
}
