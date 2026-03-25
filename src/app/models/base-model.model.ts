export class BaseModel {

  constructor(data?: any) {

  }

  protected toCamelCase(data: any) {

    const result: any = {};

    Object.keys(data).forEach(key => {

      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );

      result[camelKey] = data[key];

    });

    return result;

  }

  private toSnakeCase(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  get payload() {

    const result: any = {};

    Object.keys(this).forEach(key => {

      if (key === 'id') return;

      const value = (this as any)[key];

      if (typeof value === 'function') return;

      const snakeKey = this.toSnakeCase(key);

      result[snakeKey] = value;

    });

    return result;

  }

}
