import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCanvasToolbarComponent } from './edit-canvas-toolbar.component';

describe('EditCanvasToolbarComponent', () => {
  let component: EditCanvasToolbarComponent;
  let fixture: ComponentFixture<EditCanvasToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditCanvasToolbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCanvasToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
