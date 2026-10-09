import { Component, OnInit } from '@angular/core';
import { Supabase } from '../../services/supabase';
import { DataTableComponent, TableColumn } from '../../components/data-table-component/data-table-component';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  templateUrl: './user.html',
})
export class UserManagement implements OnInit {
  profiles: any[] = [];
  filteredProfiles: any[] = [];
  loading = false;
  errorMessage = '';

  columns: TableColumn[] = [
    { key: 'id', label: 'User ID' },
    { key: 'full_name', label: 'Full Name' },
  ];

  constructor(private supabase: Supabase) {}

  ngOnInit() {
    void this.loadProfiles();
  }

  async loadProfiles() {
    this.loading = true;
    this.errorMessage = '';

    try {
      this.profiles = await this.supabase.getProfiles();
      this.filteredProfiles = this.profiles;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not load profiles.';
    } finally {
      this.loading = false;
    }
  }

  filterProfiles(search: string) {
    const query = search.trim().toLowerCase();
    this.filteredProfiles = query
      ? this.profiles.filter(profile => [
          profile.id,
          profile.full_name,
        ].some(value => String(value ?? '').toLowerCase().includes(query)))
      : this.profiles;
  }
}
