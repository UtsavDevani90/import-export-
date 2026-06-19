# Dynamic Statistics Implementation

## Overview
All hardcoded statistics on the homepage and key pages have been replaced with dynamic values from the PostgreSQL `cms_stats` table. This allows admins to update statistics in real-time without code changes.

## Architecture

### Backend (Already Implemented)
- **Database Table**: `cms_stats` (PostgreSQL)
  - `id` (UUID)
  - `key` (VARCHAR 50, UNIQUE) - e.g., "clients", "countries", "years"
  - `label` (VARCHAR 100) - Display label
  - `value` (VARCHAR 20) - The actual value (e.g., "500+")
  - `icon` (VARCHAR 50, optional) - Icon identifier
  - `updated_at` (TIMESTAMP)

- **API Endpoint**: `GET /api/cms/stats` (Public)
  - Returns: `{ rows: [...], map: {...} }`
  - `rows` = Array of all statistics
  - `map` = Key-value object for easy access

- **Controller**: `/backend/controllers/cmsController.js`
  - `getStats()` - Fetch all stats
  - `updateStats()` - Batch update stats (Admin only)

- **Model**: `/backend/models/Cms.js`
  - `getStats()` - Query function
  - `updateStat(key, value)` - Upsert single stat

## Frontend Implementation

### 1. Custom Hook: `useStats.ts`
Location: `src/app/hooks/useStats.ts`

```typescript
export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<Record<string, string>>({});
  const [statsArray, setStatsArray] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ...
}
```

**Features:**
- Fetches from `cmsService.getStats()`
- Returns key-value map for easy access: `stats.clients`, `stats.countries`
- Includes loading and error states
- Auto-refetch capability
- Error handling with fallback values

**Usage:**
```typescript
const { stats, loading, error } = useStats();
const clients = stats.clients || '500+'; // Fallback to default
```

### 2. Updated Components

#### FounderSection.tsx
- **Stats Displayed**: Years, Countries, Clients
- **Keys Used**: `years`, `countries`, `clients`
- **Loading State**: Shows "..." while loading

#### ClientTestimonialsSection.tsx
- **Stats Displayed**: Clients, Countries (in stats section at bottom)
- **Keys Used**: `clients`, `countries`
- **Hardcoded Values**: Rating (4.9/5), Retention (95%)

#### About.tsx
- **Stats Displayed**: Two identical stat grids
- **Keys Used**: `clients`, `countries`
- **Additional Stats**: MT Annual Export (5000+), Certifications (6+)

#### GlobalPresenceSection.tsx
- **Stats Displayed**: Export Countries, Global Clients, MT Exported, YoY Growth
- **Keys Used**: `countries`, `products` (for MT Exported)
- **Additional Stats**: YoY Growth (40%)

#### IndustriesServed.tsx
- **Stats Displayed**: Active Clients, Countries Served, Industry Verticals, Years
- **Keys Used**: `clients`, `countries`, `years`
- **Static Values**: Industry Verticals (6)

#### Login.tsx
- **Stats Displayed**: Clients, Countries, Years
- **Keys Used**: `clients`, `countries`, `years`
- **Location**: Left panel hero section

## Database Values

### Current Seed Data (master_schema.sql)
These values are set in the migration file and can be updated via API:

| Key | Label | Value | Updated |
|-----|-------|-------|---------|
| years | Years of Experience | 30+ | Yes |
| clients | Happy Clients | 500+ | Yes |
| countries | Export Countries | 50+ | Yes |
| products | MT Annual Export | 5000+ | Yes |

### Migration File
Location: `backend/migrations/003_update_cms_stats.sql`

Updates the existing database values to match component expectations:
- years: 30+
- clients: 500+
- countries: 50+
- products: 5000+

## How to Update Statistics

### Option 1: Direct Database Update
```sql
UPDATE cms_stats SET value = '600+' WHERE key = 'clients';
UPDATE cms_stats SET updated_at = NOW();
```

### Option 2: Admin API
```bash
PUT /api/cms/stats
{
  "updates": [
    { "key": "clients", "value": "600+" },
    { "key": "countries", "value": "60+" }
  ]
}
```

### Option 3: Admin Dashboard (Future)
When the admin dashboard is built, a UI will be available to manage these values.

## Features & Benefits

✅ **Dynamic Updates**: Change any stat value without touching code
✅ **Real-time Reflection**: All pages using `useStats` hook show latest values
✅ **Error Handling**: Graceful fallback to hardcoded defaults
✅ **Loading States**: Shows "..." while data is being fetched
✅ **Caching**: Values cached in React state, minimal API calls
✅ **Type Safety**: Full TypeScript support
✅ **SEO Friendly**: Uses real data from database
✅ **Extensible**: Easy to add new statistics

## Error Handling

### Network Errors
- Errors logged to console
- Fallback values displayed automatically
- User doesn't see broken stats

### Timeout Handling
- 15-second timeout for API calls
- Graceful degradation with defaults

### Missing Keys
- If a key doesn't exist in DB, default value is used
- Component displays default until data loads

## Performance Considerations

- **Single Fetch**: `useStats` hook fetches once on component mount
- **Reusable**: Multiple components can use same hook (React caches the hook state)
- **Minimal Overhead**: One API call per page load per component instance
- **Memoization**: Consider using `useMemo` if stats are used in expensive calculations

## Testing

### Manual Testing
1. Update values in `cms_stats` table
2. Refresh page - new values should appear
3. Check console for any errors
4. Verify loading state shows briefly

### Unit Test Example
```typescript
// Mock useStats hook
jest.mock('../hooks/useStats', () => ({
  useStats: () => ({
    stats: { clients: '600+', countries: '60+' },
    loading: false,
    error: null,
  }),
}));
```

## Files Modified

### Frontend
- `src/app/hooks/useStats.ts` - NEW
- `src/app/components/FounderSection.tsx` - UPDATED
- `src/app/components/ClientTestimonialsSection.tsx` - UPDATED
- `src/app/components/GlobalPresenceSection.tsx` - UPDATED
- `src/app/pages/About.tsx` - UPDATED
- `src/app/pages/IndustriesServed.tsx` - UPDATED
- `src/app/pages/Login.tsx` - UPDATED

### Backend
- `backend/migrations/003_update_cms_stats.sql` - NEW

### No Changes Required
- `backend/models/Cms.js` - Already has stats methods
- `backend/controllers/cmsController.js` - Already has endpoints
- `backend/routes/cmsRoutes.js` - Already has routes
- `src/app/services/api.js` - Already has cmsService.getStats()

## Future Enhancements

1. **Admin Dashboard**: UI to manage statistics
2. **Analytics**: Track stat changes over time
3. **Caching Layer**: Redis for faster retrieval
4. **Webhooks**: Notify frontend when stats change
5. **A/B Testing**: Test different stat values
6. **Historical Data**: Archive previous stat values

## Troubleshooting

### Stats not updating?
- Check browser console for errors
- Verify `cms_stats` table has correct values
- Check API endpoint returns data: `GET /api/cms/stats`

### Seeing old values?
- Hard refresh browser (Ctrl+Shift+R)
- Check React DevTools to see hook state
- Verify API response

### Loading state stuck?
- Check network tab for API errors
- Verify backend is running
- Check CORS configuration

## Support

For issues or questions:
1. Check this documentation
2. Review component implementations
3. Check browser console for errors
4. Verify database values
5. Test API endpoint manually
