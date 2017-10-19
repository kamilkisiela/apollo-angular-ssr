import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule, TransferState, makeStateKey } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
// Apollo
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink, HttpLinkHandler } from 'apollo-angular-link-http';
import { InMemoryCache, NormalizedCache } from 'apollo-cache-inmemory';

// GraphiQL: https://launchpad.graphql.com/1jzxrj179
const uri = 'https://1jzxrj179.lp.gql.zone/graphql';

const STATE_KEY = makeStateKey<any>('apollo.state');

@NgModule({
  exports: [
    BrowserTransferStateModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {
  cache: InMemoryCache;
  link: HttpLinkHandler;

  constructor(
    private apollo: Apollo,
    private readonly transferState: TransferState,
    private httpLink: HttpLink
  ) {
    this.cache = new InMemoryCache();
    this.link = this.httpLink.create({ uri });

    this.apollo.create({
      link: this.link,
      cache: this.cache,
    });

    const isBrowser = this.transferState.hasKey<NormalizedCache>(STATE_KEY);
    
    if (isBrowser) {
      this.onBrowser();
    } else {
      this.onServer();
    }
  }

  onServer() {
    this.transferState.onSerialize(STATE_KEY, () => 
      this.cache.extract()
    );
  }

  onBrowser() {
    const state = this.transferState.get<NormalizedCache>(STATE_KEY, null);
    
    this.cache.restore(state);
  }
}
