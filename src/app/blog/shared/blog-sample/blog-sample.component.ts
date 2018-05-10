// Angular
import { Component, OnInit, Input } from '@angular/core';

// Models
import { Post, NumberOfColumns, Mode } from '../../../core/models';

// Rxjs
import { Observable } from 'rxjs/Observable';

// Store
import { Store } from '@ngrx/store';
import { BlogState } from '../../../store/datatypes';
import { getRelatedBlogs } from '../../../store/selectors';
import { GetRelatedPosts } from '../../../store/actions';
import { getNewBlogs } from '../../../store/selectors';
import { GetPosts } from '../../../store/actions';
import { BlogLoaded, BlogLoading } from '../../../store/actions';

@Component({
  selector: 'app-blog-sample',
  templateUrl: './blog-sample.component.html',
  styleUrls: ['./blog-sample.component.scss']
})
export class BlogSampleComponent implements OnInit {
  @Input('category') category?: number;
  @Input('blogId') blogId?: number;
  @Input('numberOfColumns') numberOfColumns: NumberOfColumns;
  @Input('mode') mode: Mode;

  posts: Post[] = [];

  getRelatedBlogsState$: Observable<any>;
  getNewBlogState$: Observable<any>;

  constructor(private store: Store<any>) {
    this.getRelatedBlogsState$ = this.store.select(getRelatedBlogs);
    this.getNewBlogState$ = this.store.select(getNewBlogs);
  }

  ngOnInit() {
    if (this.mode === Mode.Recent) {
      this.updateRecentState();
    } else if (this.mode === Mode.Related) {
      this.updateRelatedState();
    }
    setTimeout(() => {
      this.store.dispatch(new BlogLoading({}));
    });
  }

  updateRecentState() {
    this.getNewBlogState$.subscribe(blogs => {
      if (blogs.length) {
        blogs.map((post: Post) => {
          post.isLoaded = false;
          if (post.text.length > 500) {
            post.excerpt = post.text.substring(0, 500) + '...';
          } else {
            post.excerpt = post.text;
          }
        });
        this.posts = blogs.slice(0, this.numberOfColumns);
        this.store.dispatch(new BlogLoaded({}));
      }
    });
    if (!this.posts.length) {
      this.getPosts();
    }
  }

  updateRelatedState() {
    this.getRelatedBlogsState$.subscribe(blogs => {
      if (blogs.length && blogs[0].category.id === this.category) {
        this.posts = blogs
          .filter((post: Post) => {
            post.isLoaded = false;
            if (post.text.length > 500) {
              post.excerpt = post.text.substring(0, 500) + '...';
            } else {
              post.excerpt = post.text;
            }
            if (post.id !== this.blogId) {
              return true;
            }
            return false;
          })
          .slice(0, this.numberOfColumns);
      }
    });
    if (!this.posts.length || this.posts[0].category.id !== this.category) {
      this.getRelatedPosts();
    }
  }

  getRelatedPosts() {
    this.store.dispatch(new GetRelatedPosts(this.category));
  }

  getPosts() {
    this.store.dispatch(new GetPosts({ limit: 7, offset: 0 }));
  }

  onDestroy() {
    this.store.dispatch(new BlogLoading({}));
  }
}
