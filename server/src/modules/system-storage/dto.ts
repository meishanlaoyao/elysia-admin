import { t } from 'elysia';
import { CrudDto } from '@/types/dto';
import { InsertSystemStorage, SelectSystemStorage } from 'database/schema/system_storage';

export const CreateDto = CrudDto.create(
    InsertSystemStorage,
    SelectSystemStorage,
    ['name', 'endpoint', 'bucket', 'accessKey', 'secretKey']
);

export const UpdateDto = CrudDto.update(SelectSystemStorage, 'storageId');

export const ListDto = CrudDto.list(
    SelectSystemStorage,
    {
        name: t.Optional(t.String({ description: '存储名称' })),
    }
);