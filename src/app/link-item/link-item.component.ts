import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { Link } from '../types';
import { Subscription } from 'rxjs/Subscription';
import {timeDifferenceForDate} from '../utils';
import { GC_USER_ID } from '../constants';
import { Apollo } from 'apollo-angular';
import { CREATE_VOTE_MUTATION } from '../graphql';
import { DataProxy } from 'apollo-cache';
import { FetchResult } from 'apollo-link';

@Component({
  selector: 'hn-link-item',
  templateUrl: './link-item.component.html',
  styleUrls: ['./link-item.component.scss']
})
export class LinkItemComponent implements OnInit, OnDestroy {

  @Input() link: Link;
  @Input() index = 0;
  @Input() isAuthenticated = false;
  @Input() updateStoreAfterVote: UpdateStoreAfterVoteCallback;
  @Input() pageNumber = 0;
  subscriptions: Subscription[] = [];

  constructor(
    private apollo: Apollo
  ) {}

  ngOnInit() {}

  voteForLink() {

    const userId = localStorage.getItem(GC_USER_ID);
    const voterIds = this.link.votes.map(vote => vote.user.id);

    if (voterIds.includes(userId)) {
      alert(`User (${userId}) already voted for this link.`);
      return;
    }

    const linkId = this.link.id;

    const mutationSubscription = this.apollo.mutate({
      mutation: CREATE_VOTE_MUTATION,
      variables: {
        userId,
        linkId
      },
      update: (store, { data: { createVote } }) => {
        this.updateStoreAfterVote(store, createVote, linkId);
      }
    }).subscribe();

    this.subscriptions = [...this.subscriptions, mutationSubscription];
  }

  humanizeDate(date: string) {
    return timeDifferenceForDate(date);
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}

interface UpdateStoreAfterVoteCallback {
  (proxy: DataProxy, mutationResult: FetchResult, linkId: string);
}
