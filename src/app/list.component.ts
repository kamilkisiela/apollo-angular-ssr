import { Component, OnInit } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';

import gql from 'graphql-tag';

import 'rxjs/add/operator/map';

import { Post, Query } from './types';

@Component({
  selector: 'app-list',
  template: `
    <ul>
      <li *ngFor="let post of posts | async">
        {{post.title}} by {{post.author.firstName}} {{post.author.lastName}}
        ({{post.votes}} votes)
        <app-upvoter [postId]="post.id" [votes]="post.votes"></app-upvoter>
      </li>
    </ul>

    <button (click)="refresh()">Refresh</button>
  `
})
export class ListComponent implements OnInit {
  postsRef: QueryRef<Query>;
  posts: Observable<Post[]>;
  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.postsRef = this.apollo.watchQuery<Query>({
      query: gql`
        query allPosts {
          posts {
            id
            title
            votes
            author {
              id
              firstName
              lastName
            }
          }
        }
      `,
    });

    this.posts = this.postsRef
      .valueChanges
      .map(result => result.data.posts);
  }

  refresh() {
    this.postsRef.refetch();
  }
}
