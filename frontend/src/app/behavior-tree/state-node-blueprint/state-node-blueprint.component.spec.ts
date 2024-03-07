import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateNodeBlueprintComponent } from './state-node-blueprint.component';

describe('StateNodeBlueprintComponent', () => {
  let component: StateNodeBlueprintComponent;
  let fixture: ComponentFixture<StateNodeBlueprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StateNodeBlueprintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StateNodeBlueprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
