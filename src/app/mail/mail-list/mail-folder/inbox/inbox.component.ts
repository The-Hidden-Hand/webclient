import { Component, OnInit, Input } from '@angular/core';
import { MailListComponent } from '../../mail-list.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/datatypes';
import { ActivatedRoute } from '@angular/router';
import {Mail, MailFolderType} from '../../../../store/models';


@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent extends MailListComponent implements OnInit {

  @Input() mails: Mail[];

  constructor( public store: Store<AppState>,
    public route: ActivatedRoute) {
    super(store, route);
  }

  ngOnInit() {
    // setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    // TODO: find appropriate solution to fix this issue
    setTimeout(() => {
      this.getMails(MailFolderType.INBOX);
    });
  }
}
