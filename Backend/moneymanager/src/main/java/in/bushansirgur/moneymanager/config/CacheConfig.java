package in.bushansirgur.moneymanager.config;

import org.springframework.context.annotation.Configuration;

/**
 * Cache configuration is DISABLED.
 *
 * Caching was causing issues with:
 * - Profile data becoming stale
 * - Authentication failures due to cached Optional objects
 * - Login failures after registration
 *
 * If caching is needed in the future, implement it carefully with:
 * - Proper cache eviction strategies
 * - Avoid caching Optional objects
 * - Ensure cache keys don't collide
 */
@Configuration
// @EnableCaching - DISABLED to prevent authentication issues
public class CacheConfig {
    // Caching is disabled - no beans configured
}

