import { Component, OnInit } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { DataTableComponent, TableColumn } from '../../components/data-table-component/data-table-component';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-genre',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  templateUrl: './genre.html',
})
export class Genre implements OnInit {

  data: any[] = [];

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' }
  ];

  constructor(private supabase: Supabase) {}

  async ngOnInit() {
    this.data = await this.supabase.getGenres();
  }

}
