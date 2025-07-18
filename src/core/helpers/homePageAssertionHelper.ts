import { HomePage as OldUxHomePage } from '../pages/oldUx/homePage';
import { HomePage as NewUxHomePage } from '../pages/newUx/homePage';

export class HomePageAssertionHelper { 
  constructor(readonly homePage: OldUxHomePage | NewUxHomePage, readonly newUxEnabled: boolean) {}
}
