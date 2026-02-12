import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, RouterLink } from '@angular/router';
import { appRoutes } from './app.routes';
import { By } from '@angular/platform-browser';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();
  });

  // Verifica que el componente principal de la aplicación se cree correctamente
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy(); // Comprobamos que el componente existe
  });

  // Comprueba que la marca del navbar se renderiza con el texto correcto
  it('should render navbar brand', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges(); 
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Gym'); 
  });

  // Asegura que el router-outlet esté presente en el DOM
  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).toBeTruthy(); 
  });

  // Comprueba que los links de navegación estén presentes
  it('should render all navbar links', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const links = compiled.querySelectorAll('.nav-link');
    expect(links.length).toBeGreaterThan(0); // Debe haber al menos un link de navegación
  });

  // Comprueba que la propiedad interna 'title' del componente esté definida
  it('should have title signal defined', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app['title']).toBeDefined(); // Verifica que 'title' exista en el componente
  });

  // Verifica que el valor del título sea correcto
  it('should have correct title value', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app['title']()).toBe('gym-frontend');
  });

  // Verifica que existan todos los enlaces de navegación esperados
  it('should have all navigation links', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const expectedLinks = ['Clientes', 'Entrenadores', 'Clases', 'Membresías', 'Inscripciones', 'Pagos'];
    expectedLinks.forEach(linkText => {
      const link = Array.from(compiled.querySelectorAll('.nav-link'))
        .find(el => el.textContent?.includes(linkText));
      expect(link).toBeTruthy();
    });
  });

  // Verifica que los enlaces tengan los atributos routerLink correctos
  it('should have correct routerLink attributes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const debugEl = fixture.debugElement;

    const routerLinkValues = ['/clients', '/trainers', '/classes', '/memberships', '/inscriptions', '/payments'];

    const linksWithRouterLink = debugEl.queryAll(By.directive(RouterLink));
    const navLinksWithRouterLink = linksWithRouterLink.filter(de =>
      de.nativeElement.classList.contains('nav-link')
    );

    expect(navLinksWithRouterLink.length).toBe(routerLinkValues.length);

    routerLinkValues.forEach((route, index) => {
      const routerLinkInstance = navLinksWithRouterLink[index].injector.get(RouterLink);
      expect(routerLinkInstance.href).toBe(route);
    });
  });

  // Verifica que la marca del navbar tenga el routerLink correcto
  it('should have navbar brand with home link', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const debugEl = fixture.debugElement;

    const brandDebugEl = debugEl.query(By.css('.navbar-brand'));
    expect(brandDebugEl).toBeTruthy();

    const routerLinkInstance = brandDebugEl.injector.get(RouterLink);
    expect(routerLinkInstance.href).toBe('/');
  });

  // Verifica que el contenedor principal exista
  it('should render main container', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const mainContainer = compiled.querySelector('main.container');
    expect(mainContainer).toBeTruthy();
  });
});