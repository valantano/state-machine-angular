import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingEdgeComponent } from './drawing-edge.component';

describe('DrawingEdgeComponent', () => {
  let component: DrawingEdgeComponent;
  let fixture: ComponentFixture<DrawingEdgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DrawingEdgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DrawingEdgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
