import { PageEvent } from "@angular/material/paginator";

export abstract class PaginatedComponent<T> {

	data: T[] = [];


  pageIndex = 0;
	page = 0;
	pageSize = 10;

	total = 0;

	search = '';

	loading = false;

	protected abstract fetchData(): Promise<{
		data: T[];
		total: number;
	}>;

	async loadData() {

		this.loading = true;

		try {

			const result = await this.fetchData();

			this.data = result.data;
			this.total = result.total;

		} finally {

			this.loading = false;

		}

	}

	async onSearch(search: string) {

    this.search = search;

    this.pageIndex = 0;

    await this.loadData();

  }

  async onPageChange(event: PageEvent) {

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    await this.loadData();

  }

}
