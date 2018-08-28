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

  constructor(private readonly apollo: Apollo) {}

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
      // Apollo treats the optimisticResponse as a result of the mutation
      // and updates the cache
      // when http call is done and we receive a response
      // Apollo uses the real response as a result of mutation
      // and updates the cache
      //
      // thanks to this mechanism, you see the result of mutation right after you make an action
      // without waiting for http request to finish
      // The app feels instant
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
