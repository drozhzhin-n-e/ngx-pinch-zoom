import { CuiPinchAppPage } from './app.po';

describe('cui-pinch-app App', () => {
  let page: CuiPinchAppPage;

  beforeEach(() => {
    page = new CuiPinchAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
