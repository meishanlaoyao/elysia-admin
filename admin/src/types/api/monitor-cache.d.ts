declare namespace Api {
    namespace MonitorCache {
        interface CacheListDto {
            cacheType: string;
        }

        interface CacheKeyDto {
            cacheType: string;
            cacheKey: string;
        }

        interface UpdateCacheDto {
            cacheType: string;
            cacheKey: string;
            cacheValue: string;
        }
    }
}