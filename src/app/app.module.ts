// Angular
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { AppComponent } from './app.component';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { BlogModule } from './blog/blog.module';
import { FooterModule } from './footer/footer.module';
import { HeaderModule } from './header/header.module';
import { HomeModule } from './home/home.module';
import { MailModule } from './mail/mail.module';
import { PagesModule } from './pages/pages.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';
import { AppStoreModule } from './store/store.module';

// Services
import { BlogService } from './core/services';
import { MailService } from './core/services';
import { SharedService } from './core/services';
import { OpenPgpService } from './core/services';

import { TokenInterceptor, ErrorInterceptor } from './core/services';



///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgbModule.forRoot(),
    AppStoreModule,
    AppRoutingModule,
    BlogModule,
    FooterModule,
    HeaderModule,
    HomeModule,
    MailModule,
    PagesModule,
    UsersModule,
    SharedModule
  ],
  providers: [
    BlogService,
    SharedService,
    OpenPgpService,
    MailService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
