export interface BaseRepositoryInterface<T, CreateCrudDto, UpdateCrudDto> {
  find(): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  create(data: CreateCrudDto): Promise<T>;
  update(id: string, data: UpdateCrudDto): Promise<T | null>;
  delete(id: string): Promise<T | null>;
}
