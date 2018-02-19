import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {Apollo} from 'apollo-angular';
import {Subscription} from 'rxjs/Subscription';
import {Link} from '../types';
// 2
import {ALL_LINKS_SEARCH_QUERY, AllLinksSearchQueryResponse} from '../graphql';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';

@Component({
  selector: 'hn-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  allLinks: Link[] = [];
  loading = true;
  searchText = '';
  logged = false;
  subscriptions: Subscription[] = [];

  constructor(
    private apollo: Apollo,
    private authService: AuthService
  ) {}

  ngOnInit() {

    this.authService.isAuthenticated
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(isAuthenticated => {
        this.logged = isAuthenticated;
      });

  }

  // 3
  executeSearch() {
    if (!this.searchText) {
      return;
    }

    const querySubscription = this.apollo.watchQuery({
      query: ALL_LINKS_SEARCH_QUERY,
      variables: {
        searchText: this.searchText
      },
    })
      .valueChanges
      .subscribe((response) => {
        this.allLinks = (<any>response.data).allLinks;
        this.loading = response.loading;
      });

    this.subscriptions = [...this.subscriptions, querySubscription];
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
