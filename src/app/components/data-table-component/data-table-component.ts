import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnChanges,
	SimpleChanges,
} from '@angular/core';

import {
	CdkDragDrop,
	moveItemInArray,
} from '@angular/cdk/drag-drop';

import { SharedModule } from '../../shared.module';

export interface TableColumn {
	key: string;
	label: string;
	hidden?: boolean;
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

	@Input() showActions = false;

	// Enable/disable drag & drop
	@Input() draggable = false;

	@Output() search = new EventEmitter<string>();

	@Output() edit = new EventEmitter<any>();
	@Output() view = new EventEmitter<any>();
	@Output() delete = new EventEmitter<any>();

	// Emits the new order after dragging
	@Output() reorder = new EventEmitter<any[]>();

	displayedColumns: string[] = [];

	ngOnChanges(changes: SimpleChanges) {

		this.displayedColumns = this.columns
			.filter(c => !c.hidden)
			.map(c => c.key);

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

	onDrop(event: CdkDragDrop<any[]>) {

		if (!this.draggable) {
			return;
		}

		moveItemInArray(
			this.data,
			event.previousIndex,
			event.currentIndex
		);

		// Create a new array reference
		// so Angular can detect the changed order.
		this.data = [...this.data];

		this.reorder.emit(this.data);

	}

}
