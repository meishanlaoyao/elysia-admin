import { pgTable, bigserial, varchar, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';

export const systemDictTypeSchema = pgTable(
    'system_dict_type',
    {
        dictId: bigserial('dict_id', { mode: 'number' }).primaryKey(), // 字典ID
        dictName: varchar('dict_name', { length: 64 }).notNull().unique(), // 字典名称
        dictType: varchar('dict_type', { length: 64 }).notNull().unique(), // 字典类型
        status: boolean('status').default(true), // 状态 true正常 false停用
        ...BaseSchema,
    }
);
export const InsertSystemDictType = createInsertSchema(systemDictTypeSchema);
export const SelectSystemDictType = createSelectSchema(systemDictTypeSchema);

export const systemDictDataSchema = pgTable(
    'system_dict_data',
    {
        dictCode: bigserial('dict_code', { mode: 'number' }).primaryKey(), // 字典数据ID
        dictSort: integer('dict_sort').notNull().default(0), // 字典排序
        dictValue: varchar('dict_value', { length: 64 }).notNull(), // 字典值
        dictLabel: varchar('dict_label', { length: 64 }).notNull(), // 字典标签
        dictType: varchar('dict_type', { length: 64 }).notNull(), // 字典类型
        status: boolean('status').default(true), // 状态 true正常 false停用
        ...BaseSchema,
    }
);
export const InsertSystemDictData = createInsertSchema(systemDictDataSchema);
export const SelectSystemDictData = createSelectSchema(systemDictDataSchema);