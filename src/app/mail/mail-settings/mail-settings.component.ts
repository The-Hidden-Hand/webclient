import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDropdownConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// Store
import { Store } from '@ngrx/store';

import { BlackListDelete, ChangePassword, SettingsUpdate, SnackPush, WhiteListDelete } from '../../store/actions';
import { AppState, MailBoxesState, Settings, Timezone, TimezonesState, UserState, Payment, PaymentType } from '../../store/datatypes';
import { Observable } from 'rxjs/Observable';
import { OnDestroy, TakeUntilDestroy } from 'ngx-take-until-destroy';
import { Language, LANGUAGES } from '../../shared/config';
import { Mailbox, UserMailbox } from '../../store/models';
import { OpenPgpService } from '../../store/services';
import { PasswordValidation } from '../../users/users-create-account/users-create-account.component';


@TakeUntilDestroy()
@Component({
  selector: 'app-mail-settings',
  templateUrl: './mail-settings.component.html',
  styleUrls: ['./mail-settings.component.scss']
})
export class MailSettingsComponent implements OnInit, OnDestroy {
  @ViewChild('changePasswordModal') changePasswordModal;

  selectedIndex = -1; // Assuming no element are selected initially
  userState: UserState;
  settings: Settings;
  payment: Payment;
  paymentType = PaymentType;
  selectedMailboxForKey: UserMailbox;
  publicKey: any;
  newListContact = { show: false, type: 'Whitelist' };
  selectedLanguage: Language;
  languages: Language[] = LANGUAGES;
  timezones: Timezone[];
  changePasswordForm: FormGroup;
  showChangePasswordFormErrors = false;

  readonly destroyed$: Observable<boolean>;
  private mailboxes: Mailbox[];
  private changePasswordModalRef: NgbModalRef;

  constructor(
    private modalService: NgbModal,
    config: NgbDropdownConfig,
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private openPgpService: OpenPgpService
  ) {
    // customize default values of dropdowns used by this component tree
    config.autoClose = true; // ~'outside';
  }

  ngOnInit() {
    this.store.select(state => state.user).takeUntil(this.destroyed$)
      .subscribe((user: UserState) => {
        this.userState = user;
        this.settings = user.settings;
        this.payment = user.payment_transaction;
        if (user.settings.language) {
          this.selectedLanguage = this.languages.filter(item => item.name === user.settings.language)[0];
        }
        if (this.userState.mailboxes.length > 0) {
          this.selectedMailboxForKey = this.userState.mailboxes[0];
        }
      });
    this.store.select(state => state.timezone).takeUntil(this.destroyed$)
      .subscribe((timezonesState: TimezonesState) => {
        this.timezones = timezonesState.timezones;
      });
    this.store.select(state => state.mailboxes).takeUntil(this.destroyed$)
      .subscribe((mailboxesState: MailBoxesState) => {
        this.mailboxes = mailboxesState.mailboxes;
        if (this.mailboxes.length > 0) {
          this.publicKey = 'data:application/octet-stream;charset=utf-8;base64,' + btoa(this.mailboxes[0].public_key);
        }
      });

    this.changePasswordForm = this.formBuilder.group({
        oldPassword: ['', [Validators.required]],
        password: ['', [Validators.required]],
        confirmPwd: ['', [Validators.required]]
      },
      {
        validator: PasswordValidation.MatchPassword
      });
  }

  // == Toggle active state of the slide in price page
  toggleSlides(index) {
    this.selectedIndex = index;
    document.querySelector('.package-xs-tab > li').classList.remove('active');
    document
      .querySelector('.package-prime-col')
      .classList.remove('active-slide');
  }

  // == Methods related to ngbModal

  // == Open change password NgbModal
  openChangePasswordModal() {
    this.showChangePasswordFormErrors = false;
    this.changePasswordForm.reset();
    this.changePasswordModalRef = this.modalService.open(this.changePasswordModal, {
      centered: true,
      windowClass: 'modal-md'
    });
  }

  // == Open add custom filter NgbModal
  addCustomFilterModalOpen(customFilterContent) {
    this.modalService.open(customFilterContent, {
      centered: true,
      windowClass: 'modal-sm'
    });
  }

  // == Open billing information NgbModal
  billingInfoModalOpen(billingInfoContent) {
    this.modalService.open(billingInfoContent, {
      centered: true,
      windowClass: 'modal-lg'
    });
  }

  // == Open add new payment NgbModal
  newPaymentMethodModalOpen(newPaymentMethodContent) {
    this.modalService.open(newPaymentMethodContent, {
      centered: true,
      windowClass: 'modal-sm'
    });
  }

  // == Open make a donation NgbModal
  makeDonationModalOpen(makeDonationContent) {
    this.modalService.open(makeDonationContent, {
      centered: true,
      windowClass: 'modal-sm'
    });
  }

  public deleteWhiteList(id) {
    this.store.dispatch(new WhiteListDelete(id));
  }

  public deleteBlackList(id) {
    this.store.dispatch(new BlackListDelete(id));
  }

  updateLanguage(language: Language) {
    this.settings.language = language.name;
    this.updateSettings();
  }

  updateSettings(key?: string, value?: any) {
    if (key) {
      if (this.settings[key] !== value) {
        this.settings[key] = value;
        this.store.dispatch(new SettingsUpdate(this.settings));
      }
    } else {
      this.store.dispatch(new SettingsUpdate(this.settings));
    }
  }

  changePassword(data) {
    this.showChangePasswordFormErrors = true;
    if (this.changePasswordForm.valid) {
      this.openPgpService.generateUserKeys(data.username, data.password);
      if (this.openPgpService.getUserKeys()) {
        this.changePasswordConfirmed(data);
      } else {
        this.waitForPGPKeys(data);
      }
    }
  }

  waitForPGPKeys(data) {
    setTimeout(() => {
      if (this.openPgpService.getUserKeys()) {
        this.changePasswordConfirmed(data);
        return;
      }
      this.waitForPGPKeys(data);
    }, 500);
  }

  changePasswordConfirmed(data) {
    const requestData = {
      username: this.userState.username,
      old_password: data.oldPassword,
      password: data.password,
      confirm_password: data.confirmPwd,
      ...this.openPgpService.getUserKeys(),
    };
    this.store.dispatch(new ChangePassword(requestData));
    this.changePasswordModalRef.dismiss();
  }

  // == Toggle password visibility
  togglePassword(input: any): any {
    if (!input.value) {
      return;
    }
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  ngOnDestroy(): void {
  }

  onUpdateSettingsBtnClick() {
    this.store.dispatch(new SnackPush({message: 'Settings updated successfully.'}));
  }
}
