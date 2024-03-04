import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateNodeComponent } from './state-node.component';

describe('StateNodeComponent', () => {
  let component: StateNodeComponent;
  let fixture: ComponentFixture<StateNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StateNodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StateNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
