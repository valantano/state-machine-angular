import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyStateNodeComponent } from './empty-state-node.component';

describe('EmptyStateNodeComponent', () => {
  let component: EmptyStateNodeComponent;
  let fixture: ComponentFixture<EmptyStateNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmptyStateNodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmptyStateNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
