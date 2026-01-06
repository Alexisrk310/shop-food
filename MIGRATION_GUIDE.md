# Database Migration Guide - Execute in THIS ORDER

## Step 1: Base Schema (EXECUTE FIRST)
File: `supabase/migrations/schema.sql`

This creates the core tables:
- products
- orders
- order_items
- RLS policies for basic access

**Action:** Copy and paste the entire content into Supabase SQL Editor and run.

---

## Step 2: Profiles Setup
File: `supabase/migrations/owner_role.sql`

Creates profiles table and role management.

**Action:** Run this in SQL Editor.

---

## Step 3: Product Extensions
File: `supabase/migrations/products_extended_fields.sql`

Adds extra fields to products table:
- stock
- gender
- is_new
- sizes (jsonb)
- colors (jsonb)
- images (jsonb)

**Action:** Run this ONLY AFTER schema.sql has been executed.

---

## Step 4: Product Images Storage
File: `supabase/migrations/product_images_storage.sql`

Creates Supabase Storage bucket for product images.

**Action:** Run in SQL Editor or create manually in Storage section.

---

## Step 5: Owner Access Policies
File: `supabase/migrations/owner_orders_access.sql`

Grants owners access to view and manage all orders.

**Action:** Run in SQL Editor.

---

## Troubleshooting

### If you get "relation already exists" errors:
This means the table is already created. Skip that migration or drop the existing policies first.

### If you get "relation does not exist" errors:
You're trying to modify a table that doesn't exist. Execute Step 1 (schema.sql) first.

### To reset (CAUTION - DELETES ALL DATA):
```sql
drop schema public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
```

Then re-run all migrations in order.

---

## Quick Verification

After running all migrations, verify with:

```sql
-- Check if tables exist
select table_name from information_schema.tables 
where table_schema = 'public';

-- Check products columns
select column_name, data_type 
from information_schema.columns 
where table_name = 'products';

-- Check if storage bucket exists
select * from storage.buckets where name = 'product-images';
```
