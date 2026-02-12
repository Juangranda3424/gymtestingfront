import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { appRoutes } from './app.routes';

describe('appRoutes', () => {
  let router: Router;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(appRoutes),
        provideHttpClient(),          
        provideHttpClientTesting()    
      ],
    });
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  it('should redirect empty path to /clients', async () => {
    await harness.navigateByUrl('');
    expect(router.url).toBe('/clients');
  });

  it('should redirect unknown paths to /clients', async () => {
    await harness.navigateByUrl('/ruta-inexistente');
    expect(router.url).toBe('/clients');
  });

  describe('lazy loaded components', () => {
    const routesToTest = [
      { path: '/clients', componentName: 'List' },
      { path: '/clients/form', componentName: 'Form' },
      { path: '/clients/form/1', componentName: 'Form' },
      { path: '/trainers', componentName: 'List' },
      { path: '/trainers/form', componentName: 'Form' },
      { path: '/trainers/form/2', componentName: 'Form' },
      { path: '/classes', componentName: 'List' },
      { path: '/classes/form', componentName: 'Form' },
      { path: '/classes/form/3', componentName: 'Form' },
      { path: '/memberships', componentName: 'List' },
      { path: '/memberships/form', componentName: 'Form' },
      { path: '/memberships/form/4', componentName: 'Form' },
      { path: '/inscriptions', componentName: 'List' },
      { path: '/inscriptions/form', componentName: 'Form' },
      { path: '/inscriptions/form/5', componentName: 'Form' },
      { path: '/payments', componentName: 'List' },
      { path: '/payments/form', componentName: 'Form' },
      { path: '/payments/form/6', componentName: 'Form' },
    ];

    routesToTest.forEach(({ path, componentName }) => {
      it(`should load ${componentName} component at ${path}`, async () => {
        const component = await harness.navigateByUrl(path);
        expect(component).toBeTruthy();
        expect(component!.constructor.name).toContain(componentName);
      });
    });
  });
});