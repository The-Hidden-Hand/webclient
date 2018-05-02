// Angular
import { Component, Input } from '@angular/core';

// Service
import { SharedService } from '../shared/shared.service';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  // Switch the footer call to action for this view.
  hideFooterCallToAction: boolean = false;

  constructor(private sharedService: SharedService) {
    this.sharedService.hideFooterCallToAction
      .subscribe(data => this.hideFooterCallToAction = data);
  }
}
