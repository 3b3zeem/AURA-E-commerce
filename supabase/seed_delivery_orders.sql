-- =======================================================
-- AURA E-Commerce: Delivery & Orders Seed Script
-- Realistic Egyptian Delivery Orders with Tracking Numbers
-- =======================================================

INSERT INTO public.orders (
    id,
    status,
    total_amount,
    points_earned,
    points_redeemed,
    discount_amount,
    tracking_number,
    shipping_address,
    created_at
) VALUES 
(
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'delivered',
    3549.00,
    350,
    0,
    0.00,
    'AUR-EG-998412',
    '{
        "fullName": "Mahmoud Hassan",
        "phone": "01098765432",
        "email": "mahmoud.hassan@gmail.com",
        "street": "90th Street, Fifth Settlement",
        "buildingNo": "Bldg 14, Apt 3",
        "city": "New Cairo",
        "state": "Cairo",
        "zipCode": "11835",
        "country": "Egypt",
        "deliveryInstructions": "Please call upon arrival at building entrance gate."
    }'::jsonb,
    NOW() - INTERVAL '3 days'
),
(
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'shipped',
    1974.00,
    190,
    0,
    100.00,
    'AUR-EG-883019',
    '{
        "fullName": "Nour El-Din Ahmed",
        "phone": "01234567890",
        "email": "nour.ahmed@outlook.com",
        "street": "Fouad Street, Downtown",
        "buildingNo": "Flat 5, Floor 2",
        "city": "Alexandria",
        "state": "Alexandria",
        "zipCode": "21500",
        "country": "Egypt",
        "deliveryInstructions": "Deliver between 2 PM and 6 PM."
    }'::jsonb,
    NOW() - INTERVAL '1 day'
),
(
    'a1b2c3d4-e5f6-7890-abcd-333333333333',
    'processing',
    4290.00,
    420,
    50,
    50.00,
    'AUR-EG-774102',
    '{
        "fullName": "Sara Ibrahim",
        "phone": "01122334455",
        "email": "sara.ibrahim@yahoo.com",
        "street": "El-Ghaiesh St, Near Stadium",
        "buildingNo": "Tower B, Apt 11",
        "city": "Mansoura",
        "state": "Dakahlia",
        "zipCode": "35511",
        "country": "Egypt",
        "deliveryInstructions": "Leave package with front receptionist."
    }'::jsonb,
    NOW() - INTERVAL '5 hours'
),
(
    'a1b2c3d4-e5f6-7890-abcd-444444444444',
    'pending',
    2450.00,
    245,
    0,
    0.00,
    'AUR-EG-661048',
    '{
        "fullName": "Karim Mostafa",
        "phone": "01555667788",
        "email": "karim.mostafa@gmail.com",
        "street": "Kornish El-Nile",
        "buildingNo": "Building 8",
        "city": "Luxor",
        "state": "Luxor",
        "zipCode": "85511",
        "country": "Egypt",
        "deliveryInstructions": "Call 15 minutes before arrival."
    }'::jsonb,
    NOW()
),
(
    'a1b2c3d4-e5f6-7890-abcd-555555555555',
    'shipped',
    1550.00,
    155,
    0,
    0.00,
    'AUR-EG-552910',
    '{
        "fullName": "Tarek Omar",
        "phone": "01011223344",
        "email": "tarek.omar@gmail.com",
        "street": "Pyramids Road",
        "buildingNo": "Apt 2, Bldg 45",
        "city": "Giza",
        "state": "Giza",
        "zipCode": "12511",
        "country": "Egypt",
        "deliveryInstructions": "Cash payment ready at door."
    }'::jsonb,
    NOW() - INTERVAL '12 hours'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    shipping_address = EXCLUDED.shipping_address;

-- Insert Corresponding Order Items
INSERT INTO public.order_items (
    order_id,
    product_name,
    product_image,
    price,
    quantity
) VALUES
('a1b2c3d4-e5f6-7890-abcd-111111111111', 'AURA SoundMaster Pro Wireless Headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 3499.00, 1),
('a1b2c3d4-e5f6-7890-abcd-222222222222', 'AURA Mechanical RGB Gaming Keyboard', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', 1899.00, 1),
('a1b2c3d4-e5f6-7890-abcd-333333333333', 'AURA UltraSync Smart Watch Series X', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 4200.00, 1),
('a1b2c3d4-e5f6-7890-abcd-444444444444', 'AURA Audio Accessory Kit', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 2450.00, 1),
('a1b2c3d4-e5f6-7890-abcd-555555555555', 'AURA Precision Ergonomic Gaming Mouse', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', 1500.00, 1);
