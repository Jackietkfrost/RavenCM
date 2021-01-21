import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProficienciesComponent } from './proficiencies.component';

describe('ProficienciesComponent', () => {
  let component: ProficienciesComponent;
  let fixture: ComponentFixture<ProficienciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProficienciesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProficienciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
