import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatsComponent } from './feats.component';

describe('FeatsComponent', () => {
  let component: FeatsComponent;
  let fixture: ComponentFixture<FeatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
