import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';

@Component({
  standalone: true,
  template: '',
})
class TestPage {}

describe('App', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideRouter([
          { path: '', component: TestPage },
          { path: 'following', component: TestPage },
          { path: 'login', component: TestPage },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
  });

  it('shows the shared shell for app screens and hides it on authentication screens', async () => {
    fixture.detectChanges();
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/following');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.app-sidebar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-navbar')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Following');

    await router.navigateByUrl('/login');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.app-sidebar')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-navbar')).toBeNull();
  });
});
