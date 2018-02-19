import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import {Apollo} from 'apollo-angular';

import {CREATE_LINK_MUTATION, CreateLinkMutationResponse, ALL_LINKS_QUERY} from '../graphql';
import { Link } from '../types';
import { GC_USER_ID, LINKS_PER_PAGE } from '../constants';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'hn-create-link',
  templateUrl: './create-link.component.html',
  styleUrls: ['./create-link.component.scss']
})
export class CreateLinkComponent implements OnInit, OnDestroy {

  description = '';
  url = '';
  subscriptions: Subscription[] = [];

  constructor(
    private apollo: Apollo,
    private router: Router
  ) { }

  ngOnInit() {
  }

  createLink() {

    const postedById = localStorage.getItem(GC_USER_ID);
    if (!postedById) {
      console.error('No user logged in');
      return;
    }

    this.apollo.mutate<Link>({
      mutation: CREATE_LINK_MUTATION,
      variables: {
        description: this.description,
        url: this.url,
        postedById: postedById
      },
      update: (store, { data: { createLink } }) => {
        const data: any = store.readQuery({
          query: ALL_LINKS_QUERY
        });

        data.allLinks.push(createLink);
        store.writeQuery({ query: ALL_LINKS_QUERY, data });
      }
    }).subscribe(response => {
      this.router.navigate(['/']);
    });
  }

  createLink2() {
    const postedById = localStorage.getItem(GC_USER_ID);
    if (!postedById) {
      console.error('No user logged in');
      return;
    }

    const newDescription = this.description;
    const newUrl = this.url;
    this.description = '';
    this.url = '';

    const createMutationSubscription = this.apollo.mutate<CreateLinkMutationResponse>({
      mutation: CREATE_LINK_MUTATION,
      variables: {
        description: newDescription,
        url: newUrl,
        postedById
      },
      update: (store, { data: { createLink } }) => {
        const data: any = store.readQuery({
          query: ALL_LINKS_QUERY,
          variables: {
            first: LINKS_PER_PAGE,
            skip: 0,
            orderBy: 'createdAt_DESC'
          }
        });
        const allLinks = data.allLinks.slice();
        allLinks.splice(0, 0, createLink);
        allLinks.pop();
        data.allLinks = allLinks;
        store.writeQuery({
          query: ALL_LINKS_QUERY,
          variables: {
            first: LINKS_PER_PAGE,
            skip: 0,
            orderBy: 'createdAt_DESC'
          },
          data
        });
      },
    }).subscribe((response) => {
      // We injected the Router service
      this.router.navigate(['/']);
    }, (error) => {
      console.error(error);
      this.description = newDescription;
      this.url = newUrl;
    });

    this.subscriptions = [...this.subscriptions, createMutationSubscription];
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}
