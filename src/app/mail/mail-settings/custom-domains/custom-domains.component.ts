import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDropdownConfig, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
// Store
import { Store } from '@ngrx/store';
import { OnDestroy, TakeUntilDestroy } from 'ngx-take-until-destroy';
import { Observable } from 'rxjs/Observable';

import {
  CreateDomain,
  ReadDomain,
  DeleteDomain,
  VerifyDomain
} from '../../../store/actions';

import {
  AppState, AuthState,
  Settings,
  UserState,
  Domain,
  DomainRecord
} from '../../../store/datatypes';

@TakeUntilDestroy()
@Component({
  selector: 'app-custom-domains',
  templateUrl: './custom-domains.component.html',
  styleUrls: ['./custom-domains.component.scss']
})
export class CustomDomainsComponent implements OnInit, OnDestroy {
  readonly destroyed$: Observable<boolean>;

  @ViewChild('confirmDeleteModal') confirmDeleteModal;

  userState: UserState;
  authState: AuthState;
  settings: Settings;
  domains: Domain[] = [];
  newDomain: Domain;
  newDomainError: string[];

  isAddingNewDomain = false;
  currentStep: number = 0;
  domainNameForm: FormGroup;
  verifyForm: FormGroup;
  mxForm: FormGroup;
  spfForm: FormGroup;
  dkimForm: FormGroup;
  dmarcForm: FormGroup;

  private confirmModalRef: NgbModalRef;

  constructor(
    config: NgbDropdownConfig,
    private modalService: NgbModal,
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
  ) {
    // customize default values of dropdowns used by this component tree
    config.autoClose = true; // ~'outside';
  }

  ngOnInit() {
    this.store.select(state => state.auth).takeUntil(this.destroyed$)
      .subscribe((authState: AuthState) => {
        this.authState = authState;
      });
    this.store.select(state => state.user).takeUntil(this.destroyed$)
      .subscribe((user: UserState) => {
        this.userState = user;
        this.settings = user.settings;
        this.domains = user.emailDomains;
        this.newDomain = user.emailNewDomain;
        this.newDomainError = user.emailNewDomainError;
        this.currentStep = user.currentCreationStep;
      });

    this.domainNameForm = this.formBuilder.group({
      domainNameCtrl: ['', Validators.required]
    });

    this.verifyForm = this.formBuilder.group({
    });

    this.mxForm = this.formBuilder.group({
    });

    this.spfForm = this.formBuilder.group({
    });

    this.dkimForm = this.formBuilder.group({
    });

    this.dmarcForm = this.formBuilder.group({
    });
  }

  ngOnDestroy(): void {
  }

  checkStatus(domainRecord: DomainRecord, is_verified: boolean): string {
    if (is_verified === true) {
      return 'verified';
    } else if (is_verified === false) {
      return 'failed';
    }
    return '';
  }

  startAddingNewDomain() {
    if (!this.userState.inProgress) {
      this.newDomain = null;
      this.newDomainError = [];
      this.isAddingNewDomain = true;
    }
  }

  createDomain() {
    const domain = this.domainNameForm.value.domainNameCtrl;
    if (domain !== '') {
      this.store.dispatch(new CreateDomain(domain));
    }
  }

  readDomain(id: number) {
    if (id !== null) {
      this.store.dispatch(new ReadDomain(id));
    }
  }

  verifyDomain(id: number) {
    if (id !== null) {
      this.store.dispatch(new VerifyDomain(id));
    }
  }

  finishAddingNewDomain() {
    this.isAddingNewDomain = false;
    this.newDomain = null;
    this.domainNameForm.setValue({domainNameCtrl: ''});
  }

  openConfirmDeleteModal(domain: Domain) {
    if (!this.userState.inProgress) {
      this.newDomain = domain;
      this.confirmModalRef = this.modalService.open(this.confirmDeleteModal, {
        centered: true,
        windowClass: 'modal-sm users-action-modal'
      });
    }
  }

  cancelDelete() {
    this.confirmModalRef.close();
  }

  deleteDomain() {
    this.confirmModalRef.close();
    this.store.dispatch(new DeleteDomain(this.newDomain.id));
  }
}
