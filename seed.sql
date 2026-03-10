-- ════════════════════════════════════════════════════════════════
--  ReLoop Demo Seed Data
--  Run AFTER reloop-schema.sql and AFTER creating a real user account
--  Replace ALL occurrences of '<YOUR_USER_ID>' with your actual UUID
--  Find your UUID: Supabase → Authentication → Users → copy the UUID
-- ════════════════════════════════════════════════════════════════

-- ── Step 1: Insert demo seller profiles ──────────────────────────
-- These are seeded as profile rows for the demo sellers.
-- They do NOT require real auth accounts — they are display-only profiles
-- linked to your own user_id for FK compliance.
-- 
-- IMPORTANT: The profiles table has id → auth.users FK.
-- For a real demo, create 5 actual test accounts in Supabase Auth,
-- grab their UUIDs, and insert profiles for each.
--
-- Quick workaround: use a single test account UUID for all sellers
-- (they display different usernames, which is what the app shows).

-- Replace these UUIDs after creating test accounts:
-- VintageHunter   → <SELLER_1_UUID>
-- RetroCollector  → <SELLER_2_UUID>  
-- StreetwearArchive → <SELLER_3_UUID>
-- FilmCameraClub  → <SELLER_4_UUID>
-- RetroGamesStore → <SELLER_5_UUID>

-- ── Step 2: Insert demo listings ─────────────────────────────────
-- Replace <SELLER_N_UUID> with the actual UUIDs from step 1.
-- You can use the same UUID for all sellers in a quick test setup.

-- VINTAGE & COLLECTIBLES (12 listings)
INSERT INTO public.listings (seller_id, title, description, price, category, sub, condition, location, image_urls, tags, status) VALUES
('<SELLER_1_UUID>', 'Vintage Polaroid OneStep Camera', 'Original Polaroid OneStep in great working condition. Tested with fresh 600 film — colours are vibrant. Minor cosmetic wear on the body, nothing affecting function. Comes with original strap.', 85, 'Vintage & Collectibles', 'Polaroid Cameras', 'Good', 'Fitzroy, VIC', ARRAY['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80'], ARRAY['Vintage','Collector'], 'active'),
('<SELLER_2_UUID>', 'Retro PlayStation 1 + 2 Controllers', 'OG PlayStation 1 (SCPH-7002) with 2 original Sony controllers. Fully tested, plays CDs perfectly. Controllers have zero stick drift. No memory card but easy to grab one cheap.', 120, 'Vintage & Collectibles', 'Retro Games', 'Good', 'Newtown, NSW', ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80'], ARRAY['Retro','90s','Collector'], 'active'),
('<SELLER_3_UUID>', '90s Nike Windbreaker Jacket – Size M', 'Authentic 90s Nike windbreaker in classic navy/white/red colourway. Size M, fits true to size. Light pilling on cuffs consistent with age. Rare colourway you won''t find anymore.', 60, 'Vintage & Collectibles', 'Vintage Clothing', 'Used', 'Surry Hills, NSW', ARRAY['https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80'], ARRAY['90s','Y2K','Vintage'], 'active'),
('<SELLER_1_UUID>', 'Lord of the Rings Extended DVD Box Set', 'Complete LOTR Extended Edition 4-film box set. All discs play perfectly, no scratches. Bonus appendix discs included. The definitive version.', 25, 'Vintage & Collectibles', 'DVD / Blu-ray', 'Like New', 'Fremantle, WA', ARRAY['https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&q=80'], ARRAY['Collector','Limited Edition'], 'active'),
('<SELLER_1_UUID>', 'Vinyl Record – Pink Floyd The Wall', 'Original double-LP pressing of The Wall. Plays beautifully with minimal surface noise. Sleeve has expected shelf wear. A must-have for any serious vinyl collection.', 40, 'Vintage & Collectibles', 'Vinyl Records', 'Good', 'Paddington, NSW', ARRAY['https://images.unsplash.com/photo-1542208998-f6dbbb5b2e6f?w=600&q=80'], ARRAY['Vintage','Collector'], 'active'),
('<SELLER_1_UUID>', 'Sony Walkman TPS-L2 Cassette Player', 'Original Sony Walkman TPS-L2. Sold for restoration/display. Belt needs replacing (common issue). Cosmetically excellent, original headphones included.', 95, 'Vintage & Collectibles', 'Cassette Tapes', 'For Parts', 'Collingwood, VIC', ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80'], ARRAY['Retro','Vintage','80s'], 'active'),
('<SELLER_4_UUID>', 'Film Camera – Canon AE-1 Program', 'Canon AE-1 Program in near-mint condition. Shutter fires crisply at all speeds. Light seals fresh. Comes with Canon FD 50mm f/1.8 lens. Shot one roll to confirm everything works.', 140, 'Vintage & Collectibles', 'Film Cameras', 'Like New', 'Glebe, NSW', ARRAY['https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=600&q=80'], ARRAY['Vintage','Collector'], 'active'),
('<SELLER_3_UUID>', 'Y2K Diesel Cargo Pants – Size 32', 'Authentic Diesel cargo pants from 2001-ish. Wide leg, multi-pocket, real Y2K energy. Size 32 waist, 30 inseam. Some fading on knees adding to the vibe. Waistband logo intact.', 75, 'Vintage & Collectibles', 'Vintage Clothing', 'Good', 'Fitzroy, VIC', ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80'], ARRAY['Y2K','Vintage'], 'active'),
('<SELLER_2_UUID>', 'Nintendo Game Boy Color – Teal', 'Original teal Game Boy Color in great condition. Screen is clear with no scratches. Sound works on all channels. Comes with Pokémon Yellow. Batteries not included.', 90, 'Vintage & Collectibles', 'Retro Games', 'Good', 'Newtown, NSW', ARRAY['https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=600&q=80'], ARRAY['Retro','90s','Collector'], 'active'),
('<SELLER_3_UUID>', 'Vintage Adidas Track Jacket – Size L', 'Three-stripe Adidas track jacket from the late 90s in navy/gold. Trefoil logo, not the modern badge. Size L, roomy fit. Zip is smooth, no holes in lining.', 70, 'Vintage & Collectibles', 'Vintage Clothing', 'Good', 'Surry Hills, NSW', ARRAY['https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80'], ARRAY['Retro','Vintage','90s'], 'active'),
('<SELLER_5_UUID>', 'Retro Game Cartridge – Zelda: OoT', 'Authentic Zelda: Ocarina of Time N64 cartridge (gold label). Save battery still holds. Contacts cleaned, tested on my own N64. Label is in great shape, 9/10.', 45, 'Vintage & Collectibles', 'Retro Games', 'Good', 'Newstead, QLD', ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80'], ARRAY['Retro','90s','Collector'], 'active'),
('<SELLER_3_UUID>', 'Skateboard Deck – Santa Cruz Reissue', 'Santa Cruz Screaming Hand reissue deck. Never mounted. 8.5" width. Graphics are perfect. Deck-only, trucks not included. For the collector.', 50, 'Vintage & Collectibles', 'Collectible Toys', 'Like New', 'Bondi, NSW', ARRAY['https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=600&q=80'], ARRAY['Retro','Collector'], 'active'),

-- FASHION (6 listings)
('<SELLER_3_UUID>', 'Air Jordan 4 Retro – White Cement', 'Air Jordan 4 White Cement in a solid 8/10 condition. Some yellowing on the sole expected for age. No creasing on the toe box. US10, fits true.', 260, 'Fashion', 'Shoes', 'Good', 'Surry Hills, NSW', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_3_UUID>', 'Nike Dunk Low Panda – Size 10', 'Nike Dunk Low Panda worn twice. Absolutely no creasing. Comes with original box and both lace sets. Size US10.', 220, 'Fashion', 'Shoes', 'Like New', 'Fortitude Valley, QLD', ARRAY['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_3_UUID>', 'Levi''s 501 Original Jeans – W32 L30', 'Classic Levi''s 501s in the original fit. W32 L30. Naturally worn knees and fading. Iconic red tab intact. Washed cold and hung, never tumble dried.', 65, 'Fashion', 'Clothing', 'Good', 'Richmond, VIC', ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_3_UUID>', 'Supreme Box Logo Hoodie – Navy, Size L', 'FW19 Supreme Box Logo Hooded Sweatshirt in Navy. Size Large. Worn maybe 4x, washed once on delicate. Logo is crisp, no cracking.', 310, 'Fashion', 'Hoodies', 'Good', 'Paddington, NSW', ARRAY['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_3_UUID>', 'Vintage Carhartt WIP Detroit Jacket – M', '90s era Carhartt WIP Detroit Jacket in dark brown. Waxed canvas has beautiful patina. All pockets zip correctly. Minor wear on cuffs. Size M, slightly boxy.', 130, 'Fashion', 'Jackets', 'Used', 'Brunswick, VIC', ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_3_UUID>', 'New Balance 550 – Grey/White, Size 9.5', 'NB 550 in grey/white. Worn twice — I''m a 9 so these are too big. No creases, soles are clean. Size US9.5. OG box included.', 150, 'Fashion', 'Shoes', 'Like New', 'Newtown, NSW', ARRAY['https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80'], ARRAY[]::text[], 'active'),

-- ELECTRONICS (5 listings)
('<SELLER_4_UUID>', 'Sony Alpha A6400 Camera Body', 'Sony A6400 body, shutter count under 3000. Comes with original battery, charger, strap, and box. Switching to full-frame so this needs a new home. Flawless sensor.', 750, 'Electronics', 'Cameras', 'Like New', 'Newstead, QLD', ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_2_UUID>', 'AirPods Pro 2nd Gen – Like New', 'AirPods Pro Gen 2 purchased 6 months ago. Used lightly. All ear tips included, case is unscratched. Battery health still showing 100%.', 195, 'Electronics', 'Audio', 'Like New', 'Manly, NSW', ARRAY['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_2_UUID>', 'iPad Air 5th Gen – 256GB, Space Grey', 'iPad Air 5 in Space Grey, 256GB WiFi. 87% battery health. No cracks or chips. Using a case since day one. Comes with Apple USB-C cable.', 550, 'Electronics', 'Tablets', 'Good', 'South Yarra, VIC', ARRAY['https://images.unsplash.com/photo-1544244015-0df4592ab731?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_1_UUID>', 'Dyson V11 Cordless Vacuum', 'Dyson V11 Animal in good working order. 45-55 min runtime on eco mode. Comes with all attachments and docking station. One small crack on the bin (non-structural).', 280, 'Electronics', 'Appliances', 'Good', 'Camberwell, VIC', ARRAY['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_5_UUID>', 'Nintendo Switch OLED – White', 'Switch OLED in white, used for 4 months. Screen is perfect. Dock, HDMI, Joy-Cons and USB-C charger all included. No Joy-Con drift. Comes with carrying case.', 320, 'Electronics', 'Gaming Consoles', 'Like New', 'Newstead, QLD', ARRAY['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80'], ARRAY[]::text[], 'active'),

-- HOME (4 listings)
('<SELLER_1_UUID>', 'IKEA KALLAX Shelving Unit – White 4x2', 'IKEA Kallax 8-cube unit in white. Perfect for vinyl, books, or general storage. Minor scuff on the bottom-right cube. Disassembled, all hardware included.', 85, 'Home', 'Furniture', 'Good', 'Fitzroy, VIC', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_1_UUID>', 'Smeg Retro Kettle – Cream', 'Smeg KLF03 retro kettle in cream. Used about 15 times before moving to a different kitchen aesthetic. Heating element is pristine. Comes with original box.', 65, 'Home', 'Kitchen', 'Like New', 'Collingwood, VIC', ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_1_UUID>', 'Vintage Turkish Kilim Rug – 150x240cm', 'Hand-woven Turkish kilim rug in a warm red/orange/navy palette. 150x240cm. Some natural wear along the edges. Professionally cleaned 6 months ago.', 190, 'Home', 'Rugs & Decor', 'Good', 'Brunswick, VIC', ARRAY['https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80'], ARRAY['Vintage']::text[], 'active'),
('<SELLER_2_UUID>', 'Nespresso Vertuo Next + Milk Frother', 'Nespresso Vertuo Next with Aeroccino3. Both work perfectly. Descaled 2 months ago. Comes with welcome capsule kit. Upgrading to a proper espresso machine.', 110, 'Home', 'Kitchen', 'Like New', 'Surry Hills, NSW', ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'], ARRAY[]::text[], 'active'),

-- SPORTS (3 listings)
('<SELLER_2_UUID>', 'Trek Marlin 5 Mountain Bike – Medium', '2021 Trek Marlin 5 in medium frame. 21-speed, hydraulic disc brakes. New tyres 3 months ago. Some trail scratches on the down tube. Rides brilliantly.', 580, 'Sports', 'Bikes', 'Used', 'Fremantle, WA', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_1_UUID>', 'Rogue Echo Bike – Commercial Grade', 'Rogue Echo Bike — built like a tank. Used daily for 18 months, belt in excellent condition. Console working correctly. Moving interstate — won''t fit in the van.', 650, 'Sports', 'Gym Equipment', 'Good', 'South Melbourne, VIC', ARRAY['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80'], ARRAY[]::text[], 'active'),
('<SELLER_2_UUID>', 'Surfboard – Firewire Seaside 5''7"', 'Firewire Seaside 5''7" in Thunderbolt construction. Ideal for small-to-medium surf. Two small dings repaired — fully watertight. Comes with Futures fin set and leash.', 480, 'Sports', 'Surf & Watersports', 'Good', 'Manly, NSW', ARRAY['https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80'], ARRAY[]::text[], 'active');

-- ── Done! ─────────────────────────────────────────────────────────
-- After running, visit your deployed app and refresh — listings will appear.
-- To verify: SELECT COUNT(*) FROM public.listings WHERE status = 'active';
-- Expected: 30 rows
