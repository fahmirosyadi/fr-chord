import { Component, Input, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SharedModule } from '../../shared.module';

export interface TableColumn {
  key: string;
  label: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './data-table-component.html',
})
export class DataTableComponent implements AfterViewInit {

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];

  @Input() showActions = false;
  @Output() edit = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();

  onView(row: any) {
    this.view.emit(row);
  }

  onEdit(row: any) {
    this.edit.emit(row);
  }

  dataSource = new MatTableDataSource<any>();

  displayedColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges() {

    this.dataSource.data = this.data;

    this.displayedColumns = this.columns.map(c => c.key);

    if (this.showActions) {
      this.displayedColumns.push('actions');
    }

    this.dataSource.filterPredicate = (data, filter) => {
      const search = JSON.stringify(data).toLowerCase();
      return search.includes(filter);
    };

  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  getValue(obj: any, path: string) {

    return path.split('.').reduce((o, key) => o?.[key], obj);

  }

}
