import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesSidebarComponent } from './properties-sidebar.component';

describe('PropertiesSidebarComponent', () => {
  let component: PropertiesSidebarComponent;
  let fixture: ComponentFixture<PropertiesSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PropertiesSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
