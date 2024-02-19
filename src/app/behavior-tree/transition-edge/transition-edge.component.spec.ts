import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransitionEdgeComponent } from './transition-edge.component';

describe('TransitionEdgeComponent', () => {
  let component: TransitionEdgeComponent;
  let fixture: ComponentFixture<TransitionEdgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransitionEdgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransitionEdgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
