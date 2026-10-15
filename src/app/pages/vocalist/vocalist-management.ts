import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { DataTableComponent, TableColumn } from '../../components/data-table-component/data-table-component';
import { Vocalist, VocalistInput, VocalistService } from '../../services/vocalist-service';

@Component({
  selector: 'app-vocalist-management',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  templateUrl: './vocalist.html',
  styleUrl: './vocalist.scss'
})
export class VocalistManagement implements OnInit {
  vocalists: Vocalist[] = [];
  filteredVocalists: Vocalist[] = [];
  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'lowest_note', label: 'Bottom note' },
    { key: 'highest_note', label: 'Top note' }
  ];

  name = '';
  lowestNote = '';
  highestNote = '';
  editingId: number | null = null;
  loading = false;
  saving = false;
  errorMessage = '';

  constructor(private vocalistService: VocalistService) {}

  ngOnInit() {
    void this.loadVocalists();
  }

  async loadVocalists() {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.vocalists = await this.vocalistService.getAll();
      this.filteredVocalists = this.vocalists;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not load vocalists.';
    } finally {
      this.loading = false;
    }
  }

  filterVocalists(query: string) {
    const normalized = query.trim().toLowerCase();
    this.filteredVocalists = normalized
      ? this.vocalists.filter(vocalist =>
          [vocalist.name, vocalist.lowest_note, vocalist.highest_note]
            .some(value => String(value ?? '').toLowerCase().includes(normalized))
        )
      : this.vocalists;
  }

  editVocalist(vocalist: Vocalist) {
    this.editingId = vocalist.id;
    this.name = vocalist.name;
    this.lowestNote = vocalist.lowest_note;
    this.highestNote = vocalist.highest_note;
    this.errorMessage = '';
  }

  cancelEdit() {
    this.resetForm();
  }

  startNewVocalist() {
    this.resetForm();
  }

  async saveVocalist() {
    const name = this.name.trim();
    const lowest_note = this.lowestNote.trim();
    const highest_note = this.highestNote.trim();

    if (!name || !lowest_note || !highest_note) {
      this.errorMessage = 'Enter a name and both range notes.';
      return;
    }

    const vocalist: VocalistInput = { name, lowest_note, highest_note };
    this.saving = true;
    this.errorMessage = '';
    try {
      if (this.editingId === null) {
        await this.vocalistService.create(vocalist);
      } else {
        await this.vocalistService.update(this.editingId, vocalist);
      }
      this.resetForm();
      await this.loadVocalists();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not save vocalist.';
    } finally {
      this.saving = false;
    }
  }

  async deleteVocalist(vocalist: Vocalist) {
    if (!window.confirm(`Delete ${vocalist.name}?`)) return;

    this.errorMessage = '';
    try {
      await this.vocalistService.delete(vocalist.id);
      await this.loadVocalists();
      if (this.editingId === vocalist.id) this.resetForm();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not delete vocalist.';
    }
  }

  private resetForm() {
    this.editingId = null;
    this.name = '';
    this.lowestNote = '';
    this.highestNote = '';
    this.errorMessage = '';
  }
}
