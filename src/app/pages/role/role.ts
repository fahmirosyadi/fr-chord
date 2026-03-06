import { Component, OnInit } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { DataTableComponent, TableColumn } from '../../components/data-table-component/data-table-component';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  templateUrl: './role.html',
})
export class Role implements OnInit {

  roles: any[] = [];

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' }
  ];

  constructor(private supabase: Supabase) {}

  async ngOnInit() {
    this.roles = await this.supabase.getRoles();
  }

}
