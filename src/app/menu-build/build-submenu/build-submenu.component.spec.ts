import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildSubmenuComponent } from './build-submenu.component';

describe('BuildSubmenuComponent', () => {
  let component: BuildSubmenuComponent;
  let fixture: ComponentFixture<BuildSubmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuildSubmenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
