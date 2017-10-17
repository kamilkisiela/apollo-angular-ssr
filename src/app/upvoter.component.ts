import { Component, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';

import gql from 'graphql-tag';

@Component({
  selector: 'app-upvoter',
  template: `
    <button (click)="upvote()">
      Upvote
    </button>
  `
})
export class UpvoterComponent {
  @Input() postId: number;
  @Input() votes: number;

  constructor(private apollo: Apollo) {}

  upvote() {
    this.apollo.mutate({
      mutation: gql`
        mutation upvotePost($postId: Int!) {
          upvotePost(postId: $postId) {
            id
            votes
          }
        }
      `,
      variables: {
        postId: this.postId,
      },
      optimisticResponse: {
        upvotePost: {
          id: this.postId,
          votes: this.votes + 1,
          __typename: 'Post'
        }
      },
    }).subscribe();
  }
}
