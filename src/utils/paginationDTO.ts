export class PaginationDto<T> {
    data: T[];
    total: number;
    haveNext: boolean;
    havePrev: boolean;
  
    constructor(data: T[], total: number, page: number, limit: number) {
      this.haveNext = page * limit < total;
      this.havePrev = page > 1;
      this.data = data;
      this.total = total;
    }
  }
  