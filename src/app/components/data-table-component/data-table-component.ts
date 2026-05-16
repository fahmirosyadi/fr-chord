import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnChanges,
	SimpleChanges,
} from '@angular/core';

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
export class DataTableComponent implements OnChanges {

	@Input() columns: TableColumn[] = [];
	@Input() data: any[] = [];

	@Input() loading = false;

	@Output() search = new EventEmitter<string>();

	@Input() showActions = false;
	@Output() edit = new EventEmitter<any>();
	@Output() view = new EventEmitter<any>();
	@Output() delete = new EventEmitter<any>();
	displayedColumns: string[] = [];

	ngOnChanges(changes: SimpleChanges) {

		this.displayedColumns = this.columns.map(c => c.key);

		if (this.showActions) {
			this.displayedColumns.push('actions');
		}

	}

	onView(row: any) {
		this.view.emit(row);
	}

	onEdit(row: any) {
		this.edit.emit(row);
	}

  onDelete(row: any) {
    this.delete.emit(row);
  }

	onSearch(event: Event) {

		const value = (event.target as HTMLInputElement).value;

		this.search.emit(value);

	}

	getValue(obj: any, path: string) {

		return path
			.split('.')
			.reduce((o, key) => o?.[key], obj);

	}

}
